import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Users({ users, filters }) {
  const { flash } = usePage().props;

  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 🔍 Recherche
  const [search, setSearch] = useState(filters?.search || "");

  // Message succès
  useEffect(() => {
    if (flash?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [flash?.success]);

  // 🔍 Recherche dynamique (debounce)
  useEffect(() => {
    const delay = setTimeout(() => {
      router.get(
        "/admin/users",
        { search },
        {
          preserveState: true,
          replace: true,
        }
      );
    }, 500);

    return () => clearTimeout(delay);
  }, [search]);

  // Supprimer
  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteModal(true);
  };

  const deleteUser = () => {
    router.post(
      `/admin/users/${deletingId}`,
      { _method: "delete" },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowDeleteModal(false);
          setDeletingId(null);
        },
      }
    );
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold text-gray-800">
          Gestion des utilisateurs
        </h2>
      }
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Messages */}
        {showSuccess && flash?.success && (
          <div className="mb-4 p-4 bg-green-100 border text-green-700 rounded flex justify-between">
            <span>{flash.success}</span>
            <button onClick={() => setShowSuccess(false)}>×</button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Liste des utilisateurs</h1>

          <Link
            href="/admin/users/create"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter
          </Link>
        </div>

        {/* 🔍 Recherche avec icône */}
        <div className="mb-4 flex items-center gap-4">
          <div className="relative w-1/3">
            {/* Icône */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Rechercher par nom, email ou rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Reset */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            >
              Reset
            </button>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs">ID</th>
                <th className="px-6 py-3 text-left text-xs">Nom</th>
                <th className="px-6 py-3 text-left text-xs">Email</th>
                <th className="px-6 py-3 text-left text-xs">Rôle</th>
                <th className="px-6 py-3 text-left text-xs">Date</th>
                <th className="px-6 py-3 text-left text-xs">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.data.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{user.id}</td>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/users/${user.id}/edit`}
                      className="text-blue-600 mr-3 hover:underline"
                    >
                      <PencilIcon className="h-4 w-4 inline mr-1" />
                      Edit
                    </Link>

                    <button
                      onClick={() => confirmDelete(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      <TrashIcon className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {users.data.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 flex flex-wrap gap-2">
            {users.links.map((link, index) =>
              link.url ? (
                <Link
                  key={index}
                  href={link.url}
                  className={`px-3 py-1 border rounded ${
                    link.active
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ) : (
                <span
                  key={index}
                  className="px-3 py-1 text-gray-400"
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Confirmer la suppression
            </h2>

            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Annuler
              </button>

              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}