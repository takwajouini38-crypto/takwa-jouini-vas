import React, { useState, useEffect } from "react";
import { useForm, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

export default function EditUser({ user }) {
  // Initialisation du formulaire avec Inertia useForm
  const { data, setData, processing } = useForm({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "analyst_op",
  });

  // États locaux pour la validation visuelle
  const [touched, setTouched] = useState({});
  const [localErrors, setLocalErrors] = useState({});

  // Logique de validation en temps réel (similaire à providers)
  useEffect(() => {
    const newLocalErrors = {};

    if (touched.name) {
      if (!data.name) newLocalErrors.name = "Le nom est requis.";
      else if (data.name.length < 3) newLocalErrors.name = "Minimum 3 caractères.";
    }

    if (touched.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email) newLocalErrors.email = "L'email est requis.";
      else if (!emailRegex.test(data.email)) newLocalErrors.email = "Format d'email invalide.";
    }

    setLocalErrors(newLocalErrors);
  }, [data, touched]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getStatus = (field) => {
    if (!touched[field]) return null;
    return localErrors[field] ? 'error' : 'success';
  };

  const getStyles = (field) => {
    const status = getStatus(field);
    if (status === 'success') return 'border-green-400 focus:ring-green-500 pr-10';
    if (status === 'error') return 'border-red-400 focus:ring-red-500 bg-red-50 pr-10';
    return 'border-gray-300 focus:ring-blue-500';
  };

  function submit(e) {
    e.preventDefault();
    router.post(`/admin/users/${user.id}`, {
      ...data,
      _method: "put",
    });
  }

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Gestion des Utilisateurs</h2>}
    >
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header Design identique à Providers */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <PencilSquareIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Modifier l'Utilisateur</h2>
                <p className="text-blue-100 text-sm italic">{user.name}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={submit} className="space-y-6">
              
              {/* Nom Complet */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom Complet *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className={`h-5 w-5 ${getStatus('name') === 'error' ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={`block w-full pl-10 py-2.5 rounded-lg border shadow-sm transition-all ${getStyles('name')}`}
                  />
                  {getStatus('name') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-3" />}
                  {getStatus('name') === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-3" />}
                </div>
                {localErrors.name && <p className="mt-1 text-xs text-red-600 font-medium">{localErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className={`h-5 w-5 ${getStatus('email') === 'error' ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => setData("email", e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={`block w-full pl-10 py-2.5 rounded-lg border shadow-sm transition-all ${getStyles('email')}`}
                    />
                    {getStatus('email') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-3" />}
                    {getStatus('email') === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-3" />}
                  </div>
                  {localErrors.email && <p className="mt-1 text-xs text-red-600 font-medium">{localErrors.email}</p>}
                </div>

                {/* Rôle */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rôle Système</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={data.role}
                      onChange={(e) => setData("role", e.target.value)}
                      className="block w-full pl-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm bg-white"
                    >
                      <option value="admin">Administrateur</option>
                      <option value="analyst_op">Analyste OP</option>
                      <option value="analyst_biz">Analyste Business</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Note informative (optionnelle) */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <ExclamationCircleIcon className="h-4 w-4 mt-0.5" />
                  La modification du mot de passe et de la photo de profil doit être effectuée par l'utilisateur lui-même depuis ses paramètres de sécurité.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <Link
                  href="/admin/users"
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={processing || Object.keys(localErrors).length > 0}
                  className="inline-flex items-center px-6 py-2.5 bg-blue-600 border border-transparent rounded-lg font-bold text-sm text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 shadow-md"
                >
                  {processing ? "Mise à jour..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}