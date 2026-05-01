import React, { useState, useEffect } from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  ArrowLeftIcon, 
  UserGroupIcon, 
  IdentificationIcon, 
  MapPinIcon, 
  GlobeAltIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlusCircleIcon
} from "@heroicons/react/24/outline";
import axios from "axios";

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

  const [isCheckingId, setIsCheckingId] = useState(false);

  // Validation en temps réel avec Debounce pour l'API
  useEffect(() => {
    // 1. Nom du fournisseur
    if (touched.provider_name) {
      if (!data.provider_name) {
        setLocalErrors(prev => ({ ...prev, provider_name: "Le nom du fournisseur est requis." }));
      } else {
        setLocalErrors(prev => ({ ...prev, provider_name: "" }));
        if (errors.provider_name) clearErrors('provider_name');
      }
    }

    // 2. Identifiant Fiscal (8 chiffres + 1 Lettre + Unicité)
    if (touched.id_fiscale) {
      const regexIdFiscal = /^[0-9]{8}[A-Z]$/;
      if (!data.id_fiscale) {
        setLocalErrors(prev => ({ ...prev, id_fiscale: "L'identifiant fiscal est requis." }));
      } else if (!regexIdFiscal.test(data.id_fiscale)) {
        setLocalErrors(prev => ({ ...prev, id_fiscale: "Format: 8 chiffres + 1 lettre majuscule." }));
      } else {
        const timer = setTimeout(async () => {
          setIsCheckingId(true);
          try {
            const response = await axios.get(route('providers.check-id'), {
              params: { id_fiscale: data.id_fiscale }
            });
            if (response.data.exists) {
              setLocalErrors(prev => ({ ...prev, id_fiscale: "Cet identifiant fiscal est déjà utilisé." }));
            } else {
              setLocalErrors(prev => ({ ...prev, id_fiscale: "" }));
              if (errors.id_fiscale) clearErrors('id_fiscale');
            }
          } catch (err) {
            console.error("Erreur de vérification", err);
          } finally {
            setIsCheckingId(false);
          }
        }, 500);
        return () => clearTimeout(timer);
      }
    }

    // 3. Validation Adresse
    if (touched.adresse) {
      if (!data.adresse) {
        setLocalErrors(prev => ({ ...prev, adresse: "L'adresse est requise." }));
      } else if (!hasLetters) {
    setLocalErrors(prev => ({ ...prev, adresse: "L'adresse doit contenir des lettres." }));
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
  };

  const getFieldStatus = (field) => {
    if (!touched[field]) return null;
    if (localErrors[field] || errors[field]) return 'error';
    if (field === 'id_fiscale' && isCheckingId) return 'loading';
    return 'success';
  };

  const getFieldStyles = (field) => {
    const status = getFieldStatus(field);
    if (status === 'success') return 'border-green-400 focus:ring-green-500 focus:border-green-500 pr-10';
    if (status === 'error') return 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 pr-10';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ provider_name: true, id_fiscale: true, adresse: true, nationnalite: true });

    if (localErrors.provider_name || localErrors.id_fiscale || localErrors.adresse || !data.provider_name) {
      return;
    }
    post("/providers");
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Ajouter un Fournisseur</h2>}
    >
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserGroupIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Ajouter un Partenaire</h2>
                <p className="text-blue-100 text-sm">Enregistrez un nouveau fournisseur</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom du fournisseur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserGroupIcon className={`h-5 w-5 ${getFieldStatus('provider_name') === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={data.provider_name}
                    onChange={(e) => handleChange('provider_name', e.target.value)}
                    onBlur={() => handleBlur('provider_name')}
                    className={`block w-full pl-10 rounded-lg border py-2.5 transition-all ${getFieldStyles('provider_name')}`}
                    placeholder="Ex: Orange Tunisie"
                  />
                  <div className="absolute right-3 top-3">
                    {getFieldStatus('provider_name') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                    {getFieldStatus('provider_name') === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-500" />}
                  </div>
                </div>
                {localErrors.provider_name && touched.provider_name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><ExclamationCircleIcon className="h-3 w-3" /> {localErrors.provider_name}</p>
                )}
              </div>

              {/* Nationalité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={data.nationnalite}
                    onChange={(e) => handleChange('nationnalite', e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-blue-500"
                  >
                    <option value="Tunisienne">Tunisienne</option>
                    <option value="Étrangère">Étrangère</option>
                  </select>
                </div>
              </div>

              {/* Identifiant Fiscal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Identifiant Fiscal *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdentificationIcon className={`h-5 w-5 ${getFieldStatus('id_fiscale') === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={data.id_fiscale}
                    onChange={(e) => handleChange('id_fiscale', e.target.value.toUpperCase())}
                    onBlur={() => handleBlur('id_fiscale')}
                    className={`block w-full pl-10 rounded-lg border py-2.5 transition-all ${getFieldStyles('id_fiscale')}`}
                    placeholder="Ex: 12345678A"
                  />
                  <div className="absolute right-3 top-3">
                    {isCheckingId ? (
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        {getFieldStatus('id_fiscale') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500" />}
                        {getFieldStatus('id_fiscale') === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-500" />}
                      </>
                    )}
                  </div>
                </div>
                {localErrors.id_fiscale && touched.id_fiscale && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><ExclamationCircleIcon className="h-3 w-3" /> {localErrors.id_fiscale}</p>
                )}
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPinIcon className={`h-5 w-5 ${getFieldStatus('adresse') === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <textarea
                    value={data.adresse}
                    onChange={(e) => handleChange('adresse', e.target.value)}
                    onBlur={() => handleBlur('adresse')}
                    rows="3"
                    className={`block w-full pl-10 rounded-lg border py-2.5 transition-all ${getFieldStyles('adresse')}`}
                    placeholder="Adresse du siège social..."
                  />
                </div>
                {localErrors.adresse && touched.adresse && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1"><ExclamationCircleIcon className="h-3 w-3" /> {localErrors.adresse}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Link href="/providers" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                  <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Link>
                <button
                  type="submit"
                  disabled={processing || isCheckingId}
                  className="inline-flex items-center px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-all"
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