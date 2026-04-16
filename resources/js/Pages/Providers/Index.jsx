import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon 
} from "@heroicons/react/24/outline";

export default function Index({ fournisseurs }) {
  const { flash } = usePage().props;
  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (flash?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [flash?.success]);

  function confirmDelete(id) {
    setDeletingId(id);
    setShowDeleteModal(true);
  }

  function deleteFournisseur(id) {
    router.post(`/providers/${id}`, {
      _method: "delete",
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setShowDeleteModal(false);
        setDeletingId(null);
      },
    });
  }

  return (
    <AuthenticatedLayout 
        header={<h2 className="text-xl font-semibold text-gray-800">Gestion des Fournisseurs</h2>}
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {/* Messages flash */}
        {showSuccess && flash?.success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center shadow-sm">
            <span>{flash.success}</span>
            <button onClick={() => setShowSuccess(false)} className="font-bold text-xl leading-none">×</button>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Liste des Partenaires</h1>
          <Link 
            href="/providers/create" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 transition shadow-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" /> Nouveau Fournisseur
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationalité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Fiscal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fournisseurs.data.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{f.provider_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{f.nationnalite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{f.id_fiscale || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{f.adresse || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/providers/${f.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4 inline-flex items-center">
                        <PencilIcon className="h-4 w-4 mr-1" /> Modifier
                      </Link>
                      <button onClick={() => confirmDelete(f.id)} className="text-red-600 hover:text-red-900 inline-flex items-center">
                        <TrashIcon className="h-4 w-4 mr-1" /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Style Service */}
          {fournisseurs.links && fournisseurs.links.length >= 1 && (
            <div className="px-6 py-4 bg-white border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{fournisseurs.from || 0}</span> à{" "}
                  <span className="font-medium">{fournisseurs.to || 0}</span> sur{" "}
                  <span className="font-medium">{fournisseurs.total}</span> résultats
                </div>
                <div className="flex items-center space-x-2">
                  {fournisseurs.links.map((link, index) => {
                    if (!link.url) {
                      return (
                        <span
                          key={index}
                          className="px-3 py-1 text-gray-400 cursor-default border border-gray-200 rounded-md text-sm bg-gray-50"
                          dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                      );
                    }

                    const isPrevious = link.label.includes("Précédent") || link.label.includes("&laquo;");
                    const isNext = link.label.includes("Suivant") || link.label.includes("&raquo;");

                    return (
                      <Link
                        key={index}
                        href={link.url}
                        className={`inline-flex items-center px-3 py-1 rounded-md text-sm border ${
                          link.active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {isPrevious && <ChevronLeftIcon className="h-4 w-4 mr-1" />}
                        <span dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo; ', '').replace(' &raquo;', '') }} />
                        {isNext && <ChevronRightIcon className="h-4 w-4 ml-1" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowDeleteModal(false)}></div>
            <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Supprimer le partenaire</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer ce fournisseur ? Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button onClick={() => deleteFournisseur(deletingId)} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Supprimer</button>
                <button onClick={() => setShowDeleteModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}