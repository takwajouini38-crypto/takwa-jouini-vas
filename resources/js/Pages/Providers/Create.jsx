import React, { useState, useEffect } from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  ArrowLeftIcon, 
  UserGroupIcon, // Remplacer ServerIcon
  IdentificationIcon, // Remplacer HashtagIcon
  MapPinIcon, // Remplacer TagIcon
  GlobeAltIcon, // Remplacer DocumentTextIcon
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";

export default function Create() {
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    provider_name: "",
    nationnalite: "Tunisienne",
    id_fiscale: "",
    adresse: "",
  });

  const [touched, setTouched] = useState({
    provider_name: false,
    nationnalite: false,
    id_fiscale: false,
    adresse: false
  });

  const [localErrors, setLocalErrors] = useState({
    provider_name: "",
    id_fiscale: "",
    adresse: ""
  });

  // Validation en temps réel (Logique identique à Services)
  useEffect(() => {
    // Nom du fournisseur
    if (touched.provider_name) {
      if (!data.provider_name) {
        setLocalErrors(prev => ({ ...prev, provider_name: "Le nom du fournisseur est requis." }));
      } else if (data.provider_name.length < 3) {
        setLocalErrors(prev => ({ ...prev, provider_name: "Le nom doit contenir au moins 3 caractères." }));
      } else {
        setLocalErrors(prev => ({ ...prev, provider_name: "" }));
        if (errors.provider_name) clearErrors('provider_name');
      }
    }

    // Identifiant Fiscal (8 chiffres + 1 Lettre)
    if (touched.id_fiscale) {
      const regexIdFiscal = /^[0-9]{8}[A-Z]$/;
      if (!data.id_fiscale) {
        setLocalErrors(prev => ({ ...prev, id_fiscale: "L'identifiant fiscal est requis." }));
      } else if (!regexIdFiscal.test(data.id_fiscale)) {
        setLocalErrors(prev => ({ ...prev, id_fiscale: "Format: 8 chiffres + 1 lettre majuscule (ex: 12345678A)." }));
      } else {
        setLocalErrors(prev => ({ ...prev, id_fiscale: "" }));
        if (errors.id_fiscale) clearErrors('id_fiscale');
      }
      // Validation Adresse en temps réel
    if (touched.adresse) {
      if (!data.adresse) {
        setLocalErrors(prev => ({ ...prev, adresse: "L'adresse est requise." }));
      } else if (data.adresse.length < 5) {
        setLocalErrors(prev => ({ ...prev, adresse: "L'adresse doit être plus précise (min. 5 caractères)." }));
      } else {
        setLocalErrors(prev => ({ ...prev, adresse: "" }));
        if (errors.adresse) clearErrors('adresse');
      }
    }
    }

    // Adresse
    if (touched.adresse) {
      if (!data.adresse) {
        setLocalErrors(prev => ({ ...prev, adresse: "L'adresse est requise." }));
      } else {
        setLocalErrors(prev => ({ ...prev, adresse: "" }));
        if (errors.adresse) clearErrors('adresse');
      }
    }
  }, [data, touched, errors]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleChange = (field, value) => {
    setData(field, value);
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ provider_name: true, id_fiscale: true, adresse: true, nationnalite: true });

    const regexIdFiscal = /^[0-9]{8}[A-Z]$/;
    if (!data.provider_name || !data.adresse || !regexIdFiscal.test(data.id_fiscale)) {
      return;
    }

    post("/providers");
  };

  const getFieldStatus = (field) => {
    if (!touched[field]) return null;
    if (field === 'provider_name') return (!data.provider_name || data.provider_name.length < 3) ? 'error' : 'success';
    if (field === 'id_fiscale') return !/^[0-9]{8}[A-Z]$/.test(data.id_fiscale) ? 'error' : 'success';
    if (field === 'adresse') return !data.adresse ? 'error' : 'success';
    return 'success';
  };

  const getFieldStyles = (field) => {
    const status = getFieldStatus(field);
    if (status === 'success') return 'border-green-400 focus:ring-green-500 focus:border-green-500 pr-10';
    if (status === 'error') return 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 pr-10';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Ajouter un Fournisseur</h2>}
    >
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* HEADER AVEC GRADIENT BLEU (Exactement comme Services) */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Ajouter un Partenaire</h2>
                <p className="text-blue-100 text-sm mt-0.5">Enregistrez un nouveau fournisseur de services</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nom du fournisseur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du fournisseur <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserGroupIcon className={`h-5 w-5 transition-colors duration-200 ${
                      getFieldStatus('provider_name') === 'success' ? 'text-green-500' : 
                      getFieldStatus('provider_name') === 'error' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="text"
                    value={data.provider_name}
                    onChange={(e) => handleChange('provider_name', e.target.value)}
                    onBlur={() => handleBlur('provider_name')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('provider_name')}`}
                    placeholder="Ex: Orange Tunisie"
                  />
                  {getFieldStatus('provider_name') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-3" />}
                  {getFieldStatus('provider_name') === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-3" />}
                </div>
                {(localErrors.provider_name && touched.provider_name) && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><ExclamationCircleIcon className="h-3 w-3" /> {localErrors.provider_name}</p>
                )}
              </div>

              {/* Nationalité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={data.nationnalite}
                    onChange={(e) => handleChange('nationnalite', e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200 appearance-none"
                  >
                    <option value="Tunisienne">Tunisienne</option>
                    <option value="Étrangère">Étrangère</option>
                  </select>
                </div>
              </div>

              {/* Identifiant Fiscal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant Fiscal <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdentificationIcon className={`h-5 w-5 transition-colors duration-200 ${
                      getFieldStatus('id_fiscale') === 'success' ? 'text-green-500' : 
                      getFieldStatus('id_fiscale') === 'error' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="text"
                    value={data.id_fiscale}
                    onChange={(e) => handleChange('id_fiscale', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('id_fiscale')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('id_fiscale')}`}
                    placeholder="Ex: 12345678A"
                  />
                  {getFieldStatus('id_fiscale') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-3" />}
                  {getFieldStatus('id_fiscale') === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-500 absolute right-3 top-3" />}
                </div>
                {(localErrors.id_fiscale && touched.id_fiscale) && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><ExclamationCircleIcon className="h-3 w-3" /> {localErrors.id_fiscale}</p>
                )}
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPinIcon className={`h-5 w-5 ${getFieldStatus('adresse') === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <textarea
                    value={data.adresse}
                    onChange={(e) => handleChange('adresse', e.target.value)}
                    onBlur={() => handleBlur('adresse')}
                    rows="3"
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('adresse')}`}
                    placeholder="Adresse du siège social..."
                  />
                </div>
                {(localErrors.adresse && touched.adresse) && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><ExclamationCircleIcon className="h-3 w-3" /> {localErrors.adresse}</p>
                )}
              </div>

              {/* BUTTONS GROUP (Exactement comme Services) */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Link
                  href="/providers"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 border border-blue-600 rounded-lg font-semibold text-sm text-white hover:bg-blue-700 transition-all shadow-sm"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Retour à la liste
                </Link>

                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center px-6 py-2.5 bg-green-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all disabled:opacity-50 shadow-sm"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  {processing ? "Enregistrement..." : "Créer le fournisseur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}