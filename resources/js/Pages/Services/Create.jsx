import React, { useState, useEffect } from "react";
import { Link, useForm } from "@inertiajs/react";
import axios from "axios"; // Importation pour la vérification Oracle
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  ArrowLeftIcon, 
  ServerIcon, 
  HashtagIcon, 
  TagIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
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
              <h2 className="text-xl font-bold text-gray-900">Confirmer la création</h2>
              <p className="text-sm text-gray-500 mt-1">Vérifiez les informations</p>
            </div>
            <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <ServerIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Nom :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.service_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <HashtagIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Short code :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.short_code}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TagIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Mot-clé :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.keyword}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Type :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.type}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 font-medium">Prix :</span>
                <span className="text-gray-900 font-semibold">{serviceData?.price} TND</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm disabled:opacity-50"
            >
              {isLoading ? "Création..." : "Confirmer la création"}
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
  
  const [localErrors, setLocalErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nouveaux états pour la validation d'unicité (Oracle)
  const [isCheckingKeyword, setIsCheckingKeyword] = useState(false);
  const [keywordUniqueError, setKeywordUniqueError] = useState("");

  // 1. Effet pour l'unicité du Keyword avec Debounce (500ms)
  useEffect(() => {
    if (!data.keyword || data.keyword.length < 2) {
      setKeywordUniqueError("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingKeyword(true);
      try {
        const response = await axios.post('/services/check-keyword', { 
            keyword: data.keyword 
        });
        
        if (!response.data.isUnique) {
            setKeywordUniqueError("Ce mot-clé est déjà utilisé dans la base de données.");
        } else {
            setKeywordUniqueError("");
        }
      } catch (error) {
        console.error("Erreur de vérification Oracle", error);
      } finally {
        setIsCheckingKeyword(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [data.keyword]);

  // 2. Validation globale en temps réel
  useEffect(() => {
    const newErrors = {};

    if (touched.service_name) {
      if (!data.service_name) newErrors.service_name = "Le nom du service est requis.";
      else if (data.service_name.length < 2) newErrors.service_name = "Le nom doit contenir au moins 2 caractères.";
    }

    if (touched.short_code) {
      if (!data.short_code) newErrors.short_code = "Le numéro court est requis.";
      else if (!data.short_code.startsWith('216')) newErrors.short_code = "Le numéro court doit commencer par 216.";
      else if (!/^\d{7,11}$/.test(data.short_code)) newErrors.short_code = "Le numéro court doit contenir 7 à 11 chiffres.";
    }

    if (touched.type && !data.type) newErrors.type = "Le type est requis.";

    if (touched.keyword) {
      if (!data.keyword) {
        newErrors.keyword = "Le mot-clé (keyword) est obligatoire.";
      } else if (keywordUniqueError) {
        newErrors.keyword = keywordUniqueError;
      }
    }

    if (touched.price) {
      if (data.price === "" || data.price === null) {
        newErrors.price = "Le prix est obligatoire.";
      } else {
        const priceValue = parseFloat(data.price);
        const regexDecimal = /^\d+(\.\d{1,2})?$/;

        if (isNaN(priceValue) || priceValue < 0) newErrors.price = "Le prix doit être un nombre positif.";
        else if (priceValue > 10) newErrors.price = "Le prix ne doit pas dépasser 10 TND.";
        else if (!regexDecimal.test(data.price.toString())) newErrors.price = "Maximum 2 décimales.";
      }
    }

    setLocalErrors(newErrors);
  }, [data, touched, keywordUniqueError]);

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleChange = (field, value) => {
    setData(field, value);
    if (errors[field]) clearErrors(field);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allTouched = Object.keys(touched).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    
    if (!data.service_name || !data.short_code || !data.type || !data.keyword || data.price === "" || Object.keys(localErrors).length > 0) {
      return;
    }
    
    setShowConfirmModal(true);
  };

  const confirmCreate = () => {
    setIsSubmitting(true);
    post("/services", {
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
    return localErrors[field] ? 'error' : 'success';
  };

  const getFieldStyles = (field) => {
    const status = getFieldStatus(field);
    if (status === 'success') return 'border-green-400 focus:ring-green-500 focus:border-green-500 pr-10';
    if (status === 'error') return 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 pr-10';
    return 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold text-gray-800">Créer un service</h2>}
    >
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg"><ServerIcon className="h-6 w-6 text-white" /></div>
              <div>
                <h2 className="text-xl font-bold text-white">Ajouter un service</h2>
                <p className="text-blue-100 text-sm">Créez un nouveau service SMS+</p>
              </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nom du service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ServerIcon className={`h-5 w-5 ${getFieldStatus('service_name') === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={data.service_name}
                    onChange={(e) => handleChange('service_name', e.target.value)}
                    onBlur={() => handleBlur('service_name')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm transition-all ${getFieldStyles('service_name')}`}
                    placeholder="Ex: Service Premium"
                  />
                  {getFieldStatus('service_name') === 'success' && <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />}
                </div>
                {localErrors.service_name && touched.service_name && <p className="mt-1 text-xs text-red-600">{localErrors.service_name}</p>}
              </div>

              {/* Short code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numéro court <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HashtagIcon className={`h-5 w-5 ${getFieldStatus('short_code') === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={data.short_code}
                    onChange={(e) => /^\d*$/.test(e.target.value) && handleChange('short_code', e.target.value)}
                    onBlur={() => handleBlur('short_code')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm transition-all ${getFieldStyles('short_code')}`}
                    placeholder="Ex: 2161234567"
                  />
                  {getFieldStatus('short_code') === 'success' && <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />}
                </div>
                {localErrors.short_code && touched.short_code && <p className="mt-1 text-xs text-red-600">{localErrors.short_code}</p>}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type <span className="text-red-500">*</span></label>
                <select
                  value={data.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  onBlur={() => handleBlur('type')}
                  className={`block w-full py-2.5 rounded-lg border shadow-sm transition-all ${getFieldStyles('type')}`}
                >
                  <option value="">Sélectionner un type</option>
                  <option value="Service">Service</option>
                  <option value="jeu">jeu</option>
                </select>
                {localErrors.type && touched.type && <p className="mt-1 text-xs text-red-600">{localErrors.type}</p>}
              </div>

              {/* Keyword - Vérification asynchrone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot-clé (keyword) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TagIcon className={`h-5 w-5 ${getFieldStatus('keyword') === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="text"
                    value={data.keyword}
                    onChange={(e) => handleChange('keyword', e.target.value)}
                    onBlur={() => handleBlur('keyword')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm transition-all ${getFieldStyles('keyword')}`}
                    placeholder="Ex: PROMO"
                  />
                  {/* Indicateur visuel d'unicité */}
                  <div className="absolute right-3 top-3 flex items-center">
                    {isCheckingKeyword ? (
                        <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        getFieldStatus('keyword') === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
                {localErrors.keyword && touched.keyword && <p className="mt-1 text-xs text-red-600">{localErrors.keyword}</p>}
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (TND) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyDollarIcon className={`h-5 w-5 ${getFieldStatus('price') === 'error' ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    max="10"
                    value={data.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    onBlur={() => handleBlur('price')}
                    className={`block w-full pl-10 pr-10 py-2.5 rounded-lg border shadow-sm transition-all ${getFieldStyles('price')}`}
                    placeholder="0.00"
                  />
                  {getFieldStatus('price') === 'success' && <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />}
                </div>
                {localErrors.price && touched.price && <p className="mt-1 text-xs text-red-600">{localErrors.price}</p>}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <Link href="/services" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-100 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-200 transition-all">
                  <ArrowLeftIcon className="h-4 w-4" /> Retour
                </Link>
                <button
                  type="submit"
                  disabled={processing || isCheckingKeyword}
                  className="inline-flex items-center px-6 py-2.5 bg-green-600 rounded-lg font-semibold text-sm text-white uppercase hover:bg-green-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  <PlusCircleIcon className="h-4 w-4 mr-2" /> {processing ? "Enregistrement..." : "Créer le service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmCreateModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmCreate}
        serviceData={data}
        isLoading={isSubmitting}
      />
    </AuthenticatedLayout>
  );
}