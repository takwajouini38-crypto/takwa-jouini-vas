import React, { useState, useEffect } from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  ArrowLeftIcon, 
  ServerIcon, 
  HashtagIcon, 
  TagIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  PlusCircleIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";

// Modal de confirmation
const ConfirmCreateModal = ({ isOpen, onClose, onConfirm, serviceData, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <PlusCircleIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirmer la création
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Vérifiez les informations
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <p className="text-gray-700 font-medium mb-3">
              Nouveau service :
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <ServerIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Nom :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.service_name || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HashtagIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Short code :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.short_code || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TagIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Mot-clé :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.keyword || "_N"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Type :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.type || "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Prix :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.price || "0"} TND</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-amber-600 mb-4 flex items-center gap-1">
            <ExclamationCircleIcon className="h-4 w-4" />
            Assurez-vous que les informations sont correctes avant de valider.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création...
                </>
              ) : (
                "Confirmer la création"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Create() {
  const { data, setData, post, processing, errors, clearErrors } = useForm({
    service_name: "",
    short_code: "",
    type: "",
    keyword: "",
    price: "",
  });

  const [touched, setTouched] = useState({
    service_name: false,
    short_code: false,
    type: false,
    keyword: false,
    price: false
  });
  
  const [localErrors, setLocalErrors] = useState({
    service_name: "",
    short_code: "",
    type: "",
    keyword: "",
    price: ""
  });
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation en temps réel
  useEffect(() => {
    // Validation Nom du service
    if (touched.service_name) {
      if (!data.service_name) {
        setLocalErrors(prev => ({ ...prev, service_name: "Le nom du service est requis." }));
      } else if (data.service_name.length < 2) {
        setLocalErrors(prev => ({ ...prev, service_name: "Le nom doit contenir au moins 2 caractères." }));
      } else {
        setLocalErrors(prev => ({ ...prev, service_name: "" }));
        if (errors.service_name) clearErrors('service_name');
      }
    }

    // Validation Short code - DOIT COMMENCER PAR 216
    if (touched.short_code) {
      if (!data.short_code) {
        setLocalErrors(prev => ({ ...prev, short_code: "Le numéro court est requis." }));
      } else if (!data.short_code.startsWith('216')) {
        setLocalErrors(prev => ({ ...prev, short_code: "Le numéro court doit commencer par 216." }));
      } else if (!/^\d{10,13}$/.test(data.short_code)) {
        setLocalErrors(prev => ({ ...prev, short_code: "Le numéro court doit contenir 10 à 13 chiffres (216 + 7 à 10 chiffres)." }));
      } else {
        setLocalErrors(prev => ({ ...prev, short_code: "" }));
        if (errors.short_code) clearErrors('short_code');
      }
    }

    // Validation Type
    if (touched.type) {
      if (!data.type) {
        setLocalErrors(prev => ({ ...prev, type: "Le type est requis." }));
      } else {
        setLocalErrors(prev => ({ ...prev, type: "" }));
        if (errors.type) clearErrors('type');
      }
    }

    // Validation Prix - en TND
    if (touched.price) {
      if (data.price === "" || data.price === null) {
        setLocalErrors(prev => ({ ...prev, price: "Le prix est requis." }));
      } else if (isNaN(data.price) || data.price < 0 || data.price > 100) {
        setLocalErrors(prev => ({ ...prev, price: "Le prix doit être entre 0 et 100 TND." }));
      } else {
        setLocalErrors(prev => ({ ...prev, price: "" }));
        if (errors.price) clearErrors('price');
      }
    }

    // Validation Keyword (optionnel - pas d'erreur)
    if (touched.keyword) {
      if (errors.keyword) clearErrors('keyword');
      setLocalErrors(prev => ({ ...prev, keyword: "" }));
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
    
    // Marquer tous les champs comme touchés
    setTouched({
      service_name: true,
      short_code: true,
      type: true,
      keyword: true,
      price: true
    });
    
    // Vérifier si le formulaire est valide
    if (!data.service_name || !data.short_code || !data.type || data.price === "" || data.price === null) {
      return;
    }
    
    // Validation short code avec 216
    if (!data.short_code.startsWith('216')) {
      return;
    }
    
    if (!/^\d{10,13}$/.test(data.short_code)) {
      return;
    }
    
    // Validation prix en TND
    if (data.price < 0 || data.price > 100) {
      return;
    }
    
    // Si keyword est vide, mettre "_N" par défaut
    if (!data.keyword || data.keyword.trim() === "") {
      setData("keyword", "_N");
    }
    
    // Ouvrir le modal de confirmation
    setShowConfirmModal(true);
  };

  const confirmCreate = () => {
    setIsSubmitting(true);
    
    // S'assurer que keyword n'est pas vide avant l'envoi
    const submitData = { ...data };
    if (!submitData.keyword || submitData.keyword.trim() === "") {
      submitData.keyword = "_N";
    }
    
    post("/services", {
      data: submitData,
      onSuccess: () => {
        setShowConfirmModal(false);
        setIsSubmitting(false);
      },
      onError: () => {
        setIsSubmitting(false);
        setShowConfirmModal(false);
      }
    });
  };

  const getFieldStatus = (field) => {
    if (!touched[field]) return null;
    
    if (field === 'service_name') {
      if (!data.service_name) return 'error';
      if (data.service_name.length < 2) return 'error';
      return 'success';
    }
    
    if (field === 'short_code') {
      if (!data.short_code) return 'error';
      if (!data.short_code.startsWith('216')) return 'error';
      if (!/^\d{10,13}$/.test(data.short_code)) return 'error';
      return 'success';
    }
    
    if (field === 'type') {
      if (!data.type) return 'error';
      return 'success';
    }
    
    if (field === 'price') {
      if (data.price === "" || data.price === null) return 'error';
      if (isNaN(data.price) || data.price < 0 || data.price > 100) return 'error';
      return 'success';
    }
    
    if (field === 'keyword') {
      return 'success';
    }
    
    return null;
  };

  const getFieldStyles = (field) => {
    const status = getFieldStatus(field);
    if (status === 'success') {
      return 'border-green-400 focus:ring-green-500 focus:border-green-500 pr-10';
    }
    if (status === 'error') {
      return 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 pr-10';
    }
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Créer un service
        </h2>
      }
    >
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* CARD */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ServerIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Ajouter un service
                </h2>
                <p className="text-blue-100 text-sm mt-0.5">
                  Créez un nouveau service SMS+
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom du service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du service <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ServerIcon className={`h-5 w-5 transition-colors duration-200 ${
                      getFieldStatus('service_name') === 'success' ? 'text-green-500' : 
                      getFieldStatus('service_name') === 'error' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="text"
                    value={data.service_name}
                    onChange={(e) => handleChange('service_name', e.target.value)}
                    onBlur={() => handleBlur('service_name')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('service_name')}`}
                    placeholder="Ex: Service Premium"
                  />
                  {getFieldStatus('service_name') === 'success' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {getFieldStatus('service_name') === 'error' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {(localErrors.service_name && touched.service_name) && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="h-3 w-3" />
                    {localErrors.service_name}
                  </p>
                )}
                {errors.service_name && !localErrors.service_name && (
                  <p className="mt-1 text-xs text-red-600">{errors.service_name}</p>
                )}
              </div>

              {/* Short code - avec validation 216 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro court <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HashtagIcon className={`h-5 w-5 transition-colors duration-200 ${
                      getFieldStatus('short_code') === 'success' ? 'text-green-500' : 
                      getFieldStatus('short_code') === 'error' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="text"
                    value={data.short_code}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Permet de saisir uniquement des chiffres
                      if (/^\d*$/.test(value)) {
                        handleChange('short_code', value);
                      }
                    }}
                    onBlur={() => handleBlur('short_code')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('short_code')}`}
                    placeholder="Ex: 2161234567"
                  />
                  {getFieldStatus('short_code') === 'success' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {getFieldStatus('short_code') === 'error' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {(localErrors.short_code && touched.short_code) && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="h-3 w-3" />
                    {localErrors.short_code}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <HashtagIcon className="h-3 w-3" />
                  Format: 216 + 7 à 10 chiffres (ex: 2161234567)
                </p>
                {errors.short_code && !localErrors.short_code && (
                  <p className="mt-1 text-xs text-red-600">{errors.short_code}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DocumentTextIcon className={`h-5 w-5 transition-colors duration-200 ${
                      getFieldStatus('type') === 'success' ? 'text-green-500' : 
                      getFieldStatus('type') === 'error' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <select
                    value={data.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    onBlur={() => handleBlur('type')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('type')} appearance-none`}
                  >
                    <option value="">Sélectionner un type</option>
                    <option value="Service">Service</option>
                    <option value="jeu">jeu</option>
                  </select>
                  {getFieldStatus('type') === 'success' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {getFieldStatus('type') === 'error' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {(localErrors.type && touched.type) && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="h-3 w-3" />
                    {localErrors.type}
                  </p>
                )}
                {errors.type && !localErrors.type && (
                  <p className="mt-1 text-xs text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot-clé (keyword) <span className="text-gray-400 text-xs">(optionnel - sera "_N" par défaut)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={data.keyword}
                    onChange={(e) => handleChange('keyword', e.target.value)}
                    onBlur={() => handleBlur('keyword')}
                    className="block w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Ex: PROMO (laisser vide pour _N)"
                  />
                  {getFieldStatus('keyword') === 'success' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <TagIcon className="h-3 w-3" />
                  Valeur par défaut : <span className="font-mono font-semibold">_N</span>
                </p>
                {errors.keyword && (
                  <p className="mt-1 text-xs text-red-600">{errors.keyword}</p>
                )}
              </div>

              {/* Prix - en TND */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix (TND) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className={`h-5 w-5 transition-colors duration-200 ${
                      getFieldStatus('price') === 'success' ? 'text-green-500' : 
                      getFieldStatus('price') === 'error' ? 'text-red-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={data.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    onBlur={() => handleBlur('price')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm focus:ring-2 transition-all duration-200 ${getFieldStyles('price')}`}
                    placeholder="0.000"
                  />
                  {getFieldStatus('price') === 'success' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                  {getFieldStatus('price') === 'error' && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                </div>
                {(localErrors.price && touched.price) && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <ExclamationCircleIcon className="h-3 w-3" />
                    {localErrors.price}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
                  <CurrencyDollarIcon className="h-3 w-3" />
                  Montant en Dinars Tunisiens (TND)
                </p>
                {errors.price && !localErrors.price && (
                  <p className="mt-1 text-xs text-red-600">{errors.price}</p>
                )}
              </div>

              {/* BUTTONS GROUP */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 border border-blue-600 rounded-lg font-semibold text-sm text-white hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 shadow-sm"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Retour à la liste
                </Link>

                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center px-6 py-2.5 bg-green-600 border border-transparent rounded-lg font-semibold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  {processing ? "Enregistrement..." : "Créer le service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmCreateModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmCreate}
        serviceData={{
          ...data,
          keyword: data.keyword && data.keyword.trim() !== "" ? data.keyword : "_N"
        }}
        isLoading={isSubmitting}
      />
    </AuthenticatedLayout>
  );
}