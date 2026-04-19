import React, { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function Users({ users, filters }) {
  const { flash } = usePage().props;

  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

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
  const confirmDelete = (user) => {
    setDeletingUser(user);
    setDeletingId(user.id);
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
          setDeletingUser(null);
        },
      }
    );
  };

  // Générer une couleur d'avatar basée sur le nom
  const getAvatarColor = (name) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
      "from-red-500 to-red-600",
      "from-yellow-500 to-yellow-600",
      "from-cyan-500 to-cyan-600",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Fonction pour obtenir l'URL complète de la photo
  const getPhotoUrl = (photo) => {
    if (!photo) return null;
    
    // Si l'URL commence déjà par http ou /storage, on la garde telle quelle
    if (photo.startsWith('http') || photo.startsWith('/storage')) {
      return photo;
    }
    
    // Sinon, on ajoute /storage/ devant
    return `/storage/${photo}`;
  };

  // Gestionnaire d'erreur de chargement d'image
  const handleImageError = (userId) => {
    setImageErrors(prev => ({ ...prev, [userId]: true }));
  };

  // Composant Avatar
  const UserAvatar = ({ user, size = "md" }) => {
    const sizeClasses = {
      sm: "h-8 w-8 text-sm",
      md: "h-10 w-10 text-base",
      lg: "h-12 w-12 text-lg",
    };

    const sizeClass = sizeClasses[size] || sizeClasses.md;
    const hasError = imageErrors[user.id];
    
    // Vérifier si l'utilisateur a une photo et pas d'erreur
    const hasPhoto = user?.photo && user.photo !== null && !hasError;
    const photoUrl = hasPhoto ? getPhotoUrl(user.photo) : null;

    // Debug: Afficher dans la console pour vérifier
    if (user.photo) {
      console.log(`Utilisateur ${user.name}:`, {
        photo: user.photo,
        photoUrl: photoUrl,
        hasPhoto: hasPhoto
      });
    }

    if (hasPhoto && photoUrl) {
      return (
        <img
          src={photoUrl}
          alt={user.name}
          className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow-sm`}
          onError={() => handleImageError(user.id)}
        />
      );
    }

    // Sinon afficher l'avatar avec les initiales
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-br ${getAvatarColor(user.name)} flex items-center justify-center text-white font-semibold shadow-sm`}>
        {user.name.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Fonction pour le badge de rôle
  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: "Administrateur", color: "purple", icon: "👑" },
      analyst_op: { label: "Analyste OP", color: "blue", icon: "📊" },
      analyst_biz: { label: "Analyste Business", color: "green", icon: "📈" },
    };
    
    const roleInfo = roles[role] || { label: role, color: "gray", icon: "👤" };
    
    const colors = {
      purple: "bg-purple-100 text-purple-800 ring-purple-600/20",
      blue: "bg-blue-100 text-blue-800 ring-blue-600/20",
      green: "bg-green-100 text-green-800 ring-green-600/20",
      gray: "bg-gray-100 text-gray-800 ring-gray-600/20",
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${colors[roleInfo.color]}`}>
        <span>{roleInfo.icon}</span>
        {roleInfo.label}
      </span>
    );
  };

  return (
    <AuthenticatedLayout
      header={
        <div className="flex items-center gap-3">
          <UserGroupIcon className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Gestion des utilisateurs
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
              <h1 className="text-2xl font-bold text-gray-900">Liste des utilisateurs</h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez les comptes utilisateurs et leurs rôles
              </p>
            </div>

            <Link
              href="/admin/users/create"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md gap-2 font-medium"
            >
              <PlusIcon className="h-5 w-5" />
              Ajouter un utilisateur
            </Link>
          </div>
        </div>

        {/* 🔍 Recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou rôle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 gap-2 font-medium"
            >
              <XMarkIcon className="h-5 w-5" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Tableau */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date d'inscription</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {users.data.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="md" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => confirmDelete(user)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-sm"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}

                {users.data.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <UserGroupIcon className="h-12 w-12 text-gray-300" />
                        <p className="text-gray-500 font-medium">Aucun utilisateur trouvé</p>
                        <p className="text-sm text-gray-400">Essayez de modifier vos critères de recherche</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {users.data.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-gray-600">
                  Affichage de <span className="font-medium">{users.from || 0}</span> à{" "}
                  <span className="font-medium">{users.to || 0}</span> sur{" "}
                  <span className="font-medium">{users.total || 0}</span> utilisateurs
                </div>
                <div className="flex gap-2">
                  {users.links.map((link, index) =>
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
                  Êtes-vous sûr de vouloir supprimer l'utilisateur :
                </p>
                <div className="flex items-center gap-3 mb-2">
                  {deletingUser && <UserAvatar user={deletingUser} size="lg" />}
                  <div>
                    <p className="text-gray-900 font-bold">
                      {deletingUser?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {deletingUser?.email}
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
                  onClick={deleteUser}
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