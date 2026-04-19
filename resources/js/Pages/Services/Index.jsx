import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  PlusIcon,
  TrashIcon,
  ServerIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  HashtagIcon,
  TagIcon,
  CurrencyDollarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

export default function Index({ services, filters }) {
  const { flash } = usePage().props;

  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingService, setDeletingService] = useState(null);

  // Message succès
  useEffect(() => {
    if (flash?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [flash?.success]);

  // Supprimer
  const confirmDelete = (service) => {
    setDeletingService(service);
    setDeletingId(service.id);
    setShowDeleteModal(true);
  };

  const deleteService = () => {
    router.post(
      `/services/${deletingId}`,
      { _method: "delete" },
      {
        preserveScroll: true,
        onSuccess: () => {
          setShowDeleteModal(false);
          setDeletingId(null);
          setDeletingService(null);
        },
      }
    );
  };

  // Fonction pour le badge de type
  const getTypeBadge = (type) => {
    const types = {
      Standard: { color: "blue", icon: "📦" },
      Premium: { color: "purple", icon: "💎" },
      Promotionnel: { color: "orange", icon: "🎉" },
    };
    
    const typeInfo = types[type] || { color: "gray", icon: "📌" };
    
    const colors = {
      blue: "bg-blue-100 text-blue-800 ring-blue-600/20",
      purple: "bg-purple-100 text-purple-800 ring-purple-600/20",
      orange: "bg-orange-100 text-orange-800 ring-orange-600/20",
      gray: "bg-gray-100 text-gray-800 ring-gray-600/20",
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${colors[typeInfo.color]}`}>
        <span>{typeInfo.icon}</span>
        {type}
      </span>
    );
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-3">
          <ServerIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Gestion des services
          </h2>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Message de succès */}
        {showSuccess && flash?.success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm flex justify-between items-center animate-slide-down">
            <div className="flex items-center gap-3">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="font-medium">{flash.success}</span>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-green-500 hover:text-green-700 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Header avec bouton ajout */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Liste des services</h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez les services SMS+ et leurs configurations
              </p>
            </div>

            <Link
              href="/services/create"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md gap-2 font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Ajouter un service
            </Link>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Short code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Keyword</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Prix (TND)</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {services.data.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                          {service.service_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.service_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HashtagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-900">{service.short_code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-mono text-gray-900">{service.keyword || "_N"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(service.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {parseFloat(service.price).toLocaleString("fr-FR")} TND
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/services/${service.id}/edit`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all duration-200 font-medium text-sm mr-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Modifier
                      </Link>
                      <button
                        onClick={() => confirmDelete(service)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}

                {services.data.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ServerIcon className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">Aucun service trouvé</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {services.data.length > 0 && services.links && services.links.length > 3 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-gray-600">
                  Affichage de <span className="font-medium">{services.from || 0}</span> à{" "}
                  <span className="font-medium">{services.to || 0}</span> sur{" "}
                  <span className="font-medium">{services.total || 0}</span> services
                </div>
                <div className="flex gap-2">
                  {services.links.map((link, index) =>
                    link.url ? (
                      <Link
                        key={index}
                        href={link.url}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                          link.active
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ) : (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-sm text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal suppression amélioré */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Confirmer la suppression
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Cette action est irréversible
                  </p>
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-100">
                <p className="text-gray-700 font-medium mb-2">
                  Êtes-vous sûr de vouloir supprimer le service :
                </p>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm">
                    {deletingService?.service_name?.charAt(0).toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold">
                      {deletingService?.service_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Short code: {deletingService?.short_code}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-red-600 mt-3 flex items-center gap-1">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  Toutes les données associées seront supprimées définitivement.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={deleteService}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-sm"
                >
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles pour les animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}