import React, { useState, useEffect } from "react";
import { useForm, Link, router } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
  ArrowLeftIcon, 
  PencilSquareIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  TagIcon,      
  HashtagIcon,  
  KeyIcon,      
  RectangleStackIcon, 
  BanknotesIcon,
  ServerIcon
} from "@heroicons/react/24/outline";

export default function Edit({ service }) {
  // Initialisation avec le Spoofing de méthode (_method: "put")
  const { data, setData, errors, processing, clearErrors, post } = useForm({
    _method: "put",
    service_name: service.service_name || "",
    short_code: service.short_code || "",
    keyword: service.keyword || "",
    type: service.type || "",
    price: service.price || "",
  });

  const [touched, setTouched] = useState({});
  const [localErrors, setLocalErrors] = useState({});
  
  // États pour la validation d'unicité Oracle (Identique à Create)
  const [isCheckingKeyword, setIsCheckingKeyword] = useState(false);
  const [keywordUniqueError, setKeywordUniqueError] = useState("");

  // 1. Vérification d'unicité du Keyword (en ignorant l'ID actuel)
  useEffect(() => {
    if (!data.keyword || data.keyword.length < 2) {
      setKeywordUniqueError("");
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingKeyword(true);
      try {
        const response = await axios.post('/services/check-keyword', { 
            keyword: data.keyword,
            id: service.id // On envoie l'ID pour ne pas bloquer sur soi-même
        });
        
        if (!response.data.isUnique) {
            setKeywordUniqueError("Ce mot-clé est déjà utilisé par un autre service.");
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
  }, [data.keyword, service.id]);

  // 2. Validation globale (Mêmes règles que Create)
  useEffect(() => {
    const newErrors = {};

    if (touched.service_name) {
      if (!data.service_name) newErrors.service_name = "Le nom du service est requis.";
      else if (data.service_name.length < 2) newErrors.service_name = "Min. 2 caractères.";
    }

    if (touched.short_code) {
      if (!data.short_code) newErrors.short_code = "Requis.";
      // Règle 7 à 11 chiffres demandée
      else if (!/^\d{7,11}$/.test(data.short_code)) newErrors.short_code = "Doit contenir 7 à 11 chiffres.";
    }

    if (touched.type && !data.type) newErrors.type = "Le type est requis.";

    if (touched.keyword) {
      if (!data.keyword) newErrors.keyword = "Le mot-clé est obligatoire.";
      else if (keywordUniqueError) newErrors.keyword = keywordUniqueError;
    }

    if (touched.price) {
      const priceValue = parseFloat(data.price);
      const regexDecimal = /^\d+(\.\d{1,2})?$/;
      if (isNaN(priceValue) || priceValue < 0) newErrors.price = "Prix invalide.";
      else if (priceValue > 10) newErrors.price = "Max 10 TND.";
      else if (!regexDecimal.test(data.price.toString())) newErrors.price = "Max 2 décimales.";
    }

    setLocalErrors(newErrors);
  }, [data, touched, keywordUniqueError]);

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleChange = (field, value) => {
    setData(field, value);
    if (errors[field]) clearErrors(field);
  };

  const getStyles = (field) => {
    if (!touched[field]) return 'border-gray-300 focus:ring-indigo-500';
    return localErrors[field] || errors[field] 
      ? 'border-red-400 focus:ring-red-500 bg-red-50' 
      : 'border-green-400 focus:ring-green-500';
  };

  function submit(e) {
    e.preventDefault();
    // On utilise POST avec _method: "put" à cause du Spoofing Laravel
    post(route("services.update", service.id));
  }

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold text-gray-800">Configuration Services</h2>}
    >
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Header avec dégradé Indigo/Blue */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md shadow-inner">
                <PencilSquareIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Modifier le Service</h2>
                <p className="text-indigo-100/80 text-sm font-medium">ID Service : #{service.id}</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <form onSubmit={submit} className="space-y-8">
              
              {/* Nom du Service */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Nom du Service</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ServerIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={data.service_name}
                    onChange={(e) => handleChange("service_name", e.target.value)}
                    onBlur={() => handleBlur('service_name')}
                    className={`block w-full pl-12 pr-10 py-3.5 rounded-xl border-2 shadow-sm transition-all text-gray-900 font-medium ${getStyles('service_name')}`}
                  />
                  {touched.service_name && !localErrors.service_name && <CheckCircleIcon className="h-6 w-6 text-green-500 absolute right-3 top-3.5" />}
                </div>
                {localErrors.service_name && <p className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4"/> {localErrors.service_name}</p>}
              </div>

              {/* Grille Double Colonne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Numéro Court */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Numéro Court</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <HashtagIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      value={data.short_code}
                      onChange={(e) => handleChange("short_code", e.target.value.replace(/\D/g,''))}
                      onBlur={() => handleBlur('short_code')}
                      className={`block w-full pl-12 py-3.5 rounded-xl border-2 shadow-sm transition-all font-mono ${getStyles('short_code')}`}
                    />
                  </div>
                  {localErrors.short_code && <p className="mt-2 text-xs text-red-600 font-bold">{localErrors.short_code}</p>}
                </div>

                {/* Mot-clé (avec loader d'unicité) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Mot-Clé (Keyword)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      value={data.keyword}
                      onChange={(e) => handleChange("keyword", e.target.value)}
                      onBlur={() => handleBlur('keyword')}
                      className={`block w-full pl-12 py-3.5 rounded-xl border-2 shadow-sm transition-all ${getStyles('keyword')}`}
                    />
                    <div className="absolute right-3 top-3.5">
                      {isCheckingKeyword ? (
                        <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        touched.keyword && !localErrors.keyword && <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </div>
                  {localErrors.keyword && <p className="mt-2 text-xs text-red-600 font-bold">{localErrors.keyword}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Type de Service */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Type de Service</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <RectangleStackIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                    </div>
                    <select
                      value={data.type}
                      onChange={(e) => handleChange("type", e.target.value)}
                      onBlur={() => handleBlur('type')}
                      className={`block w-full pl-12 py-3.5 rounded-xl border-2 shadow-sm transition-all ${getStyles('type')}`}
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Service">Service</option>
                      <option value="jeu">jeu</option>
                    </select>
                  </div>
                  {localErrors.type && <p className="mt-2 text-xs text-red-600 font-bold">{localErrors.type}</p>}
                </div>

                {/* Prix */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Prix (TND)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <BanknotesIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={data.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      onBlur={() => handleBlur('price')}
                      className={`block w-full pl-12 py-3.5 rounded-xl border-2 shadow-sm transition-all font-bold text-indigo-600 ${getStyles('price')}`}
                    />
                  </div>
                  {localErrors.price && <p className="mt-2 text-xs text-red-600 font-bold">{localErrors.price}</p>}
                </div>
              </div>

              {/* Barre d'actions */}
              <div className="flex items-center justify-end gap-6 pt-10 border-t border-gray-100">
                <Link
                  href="/services"
                  className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={processing || isCheckingKeyword || Object.keys(localErrors).length > 0}
                  className="relative inline-flex items-center px-10 py-4 bg-indigo-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 active:scale-95 focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                >
                  {processing ? "Mise à jour..." : "Mettre à jour le service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}