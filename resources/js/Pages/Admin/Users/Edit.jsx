import React from "react";
import { Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Edit({ user }) {
  const { data, setData, errors, processing } = useForm({
    name: user.name || "",
    email: user.email || "",
    password: "",
    role: user.role || "technicien",
  });

  function submit(e) {
    e.preventDefault();

    // Utilisation de router.post avec _method put pour Laravel
    router.post(`/admin/users/${user.id}`, { ...data, _method: "put" }, { preserveScroll: true });
  }

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold text-gray-800">Modifier l'utilisateur</h2>}
    >
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link href="/admin/users" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à la liste
          </Link>
        </div>

        <div className="bg-white shadow-sm sm:rounded-lg p-6">
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe (laisser vide si inchangé)
              </label>
              <input
                type="password"
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rôle</label>
              <select
                value={data.role}
                onChange={(e) => setData("role", e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="admin">Administrateur</option>
                <option value="technicien">Technicien</option>
                <option value="analyst_op">Analyste Op</option>
                <option value="analyst_biz">Analyste Biz</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="submit"
                disabled={processing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? "Modification..." : "Modifier"}
              </button>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}