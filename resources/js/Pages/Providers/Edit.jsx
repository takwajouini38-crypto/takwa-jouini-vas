import React, { useState, useEffect } from "react";
import { useForm, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  ArrowLeftIcon, 
  UserGroupIcon, 
  IdentificationIcon, 
  MapPinIcon, 
  GlobeAltIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";

export default function Edit({ fournisseur }) {
  // Initialisation du formulaire
  const { data, setData, errors, processing, clearErrors } = useForm({
    provider_name: fournisseur.provider_name || "",
    nationnalite: fournisseur.nationnalite || "Tunisienne",
    id_fiscale: fournisseur.id_fiscale || "",
    adresse: fournisseur.adresse || "",
  });

  // États locaux pour la validation en temps réel
  const [touched, setTouched] = useState({});
  const [localErrors, setLocalErrors] = useState({});

  // Logique de validation en temps réel
  useEffect(() => {
    const newLocalErrors = {};

    if (touched.provider_name) {
      if (!data.provider_name) newLocalErrors.provider_name = "Le nom est requis.";
      else if (data.provider_name.length < 3) newLocalErrors.provider_name = "Minimum 3 caractères.";
    }

    if (touched.id_fiscale) {
      const regexIdFiscal = /^[0-9]{8}[A-Z]$/;
      if (!data.id_fiscale) newLocalErrors.id_fiscale = "L'identifiant fiscal est requis.";
      else if (!regexIdFiscal.test(data.id_fiscale)) newLocalErrors.id_fiscale = "Format: 8 chiffres + 1 lettre.";
    }

    if (touched.adresse && data.adresse && data.adresse.length < 5) {
      newLocalErrors.adresse = "L'adresse est trop courte.";
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
    return 'border-gray-300 focus:ring-indigo-500';
  };

  function submit(e) {
    e.preventDefault();
    router.post(`/providers/${fournisseur.id}`, {
      ...data,
      _method: "put",
    });
  }

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Gestion des Partenaires</h2>}
    >
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header Design (Style Services) */}
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-blue-600">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm">
                <PencilSquareIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Modifier le Fournisseur</h2>
                <p className="text-indigo-100 text-sm italic">{fournisseur.provider_name}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={submit} className="space-y-6">
              
              {/* Nom du fournisseur */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom du fournisseur *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserGroupIcon className={`h-5 w-5 ${getStatus('provider_name') === 'error' ? 'text-red-400' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={data.provider_name}
                    onChange={(e) => setData("provider_name", e.target.value)}
                    onBlur={() => handleBlur('provider_name')}
                    className={`block w-full pl-10 py-2.5 rounded-lg border shadow-sm transition-all ${getStyles('provider_name')}`}
                  />
                  {getStatus('provider_name') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-3" />}
                  {getStatus('provider_name') === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-3" />}
                </div>
                {localErrors.provider_name && <p className="mt-1 text-xs text-red-600 font-medium">{localErrors.provider_name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nationalité */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nationalité</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={data.nationnalite}
                      onChange={(e) => setData("nationnalite", e.target.value)}
                      className="block w-full pl-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm"
                    >
                      <option value="Tunisienne">Tunisienne</option>
                      <option value="Étrangère">Étrangère</option>
                    </select>
                  </div>
                </div>

                {/* ID Fiscale */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Identifiant Fiscal *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IdentificationIcon className={`h-5 w-5 ${getStatus('id_fiscale') === 'error' ? 'text-red-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      value={data.id_fiscale}
                      onChange={(e) => setData("id_fiscale", e.target.value.toUpperCase())}
                      onBlur={() => handleBlur('id_fiscale')}
                      placeholder="Ex: 12345678A"
                      className={`block w-full pl-10 py-2.5 rounded-lg border shadow-sm transition-all ${getStyles('id_fiscale')}`}
                    />
                    {getStatus('id_fiscale') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-3" />}
                    {getStatus('id_fiscale') === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-3" />}
                  </div>
                  {localErrors.id_fiscale && <p className="mt-1 text-xs text-red-600 font-medium">{localErrors.id_fiscale}</p>}
                </div>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Adresse Complète</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    value={data.adresse}
                    onChange={(e) => setData("adresse", e.target.value)}
                    onBlur={() => handleBlur('adresse')}
                    rows="3"
                    className={`block w-full pl-10 py-2.5 rounded-lg border shadow-sm transition-all ${getStyles('adresse')}`}
                  />
                </div>
                {localErrors.adresse && <p className="mt-1 text-xs text-red-600 font-medium">{localErrors.adresse}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
                <Link
                  href="/providers"
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={processing || Object.keys(localErrors).length > 0}
                  className="inline-flex items-center px-6 py-2.5 bg-indigo-600 border border-transparent rounded-lg font-bold text-sm text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 shadow-md"
                >
                  {processing ? "Enregistrement..." : "Mettre à jour"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}