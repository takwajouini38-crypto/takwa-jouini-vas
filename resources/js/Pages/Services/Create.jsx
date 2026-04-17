import React from "react";
import { Link, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    service_name: "",
    short_code: "",
    type: "",
    keyword:"",
    price: "",
  });

  function submit(e) {
    e.preventDefault();
    post("/services", {
      onSuccess: () => console.log("Service créé avec succès"),
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Créer un service
        </h2>
      }
    >
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/services"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à la liste
          </Link>
        </div>

        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Ajouter un service
            </h2>

            <form onSubmit={submit} className="space-y-6">
              {/* Nom du service */}
              <div>
                <label htmlFor="service_name" className="block text-sm font-medium text-gray-700">
                  Nom du service
                </label>
                <input
                  id="service_name"
                  type="text"
                  value={data.service_name}
                  onChange={(e) => setData("service_name", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Ex: Service Premium"
                  required
                />
                {errors.service_name && (
                  <p className="mt-2 text-sm text-red-600">{errors.service_name}</p>
                )}
              </div>


              {/* Numéro court */}
              <div>
                <label htmlFor="short_code" className="block text-sm font-medium text-gray-700">
                  Numéro court
                </label>
                <input
                  id="short_code"
                  type="text"
                  value={data.short_code}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Limite à 7 chiffres max
                    if (/^\d{0,7}$/.test(value)) {
                      setData("short_code", value);
                    }
                  }}
                  maxLength={7}
                  pattern="\d{4,7}"
                  placeholder="Ex: 1234 ou 12345"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {data.short_code.length > 7 && (
                  <p className="mt-2 text-sm text-red-600">
                    Le numéro court ne doit pas dépasser 7 chiffres.
                  </p>
                )}
                {errors.short_code && (
                  <p className="mt-2 text-sm text-red-600">{errors.short_code}</p>
                )}
              </div>

              {/* Keyword */}
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                  Mot-clé (keyword)
                </label>
                <input
                  id="keyword"
                  type="text"
                  value={data.keyword}
                  onChange={(e) => setData("keyword", e.target.value)}
                  placeholder="Ex: PROMO"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.keyword && (
                  <p className="mt-2 text-sm text-red-600">{errors.keyword}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <input
                  id="type"
                  type="text"
                  value={data.type}
                  onChange={(e) => setData("type", e.target.value)}
                  placeholder="Ex: Standard"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {errors.type && (
                  <p className="mt-2 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Prix */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Prix
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={data.price}
                  onChange={(e) => setData("price", e.target.value)}
                  placeholder="0.00"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {errors.price && (
                  <p className="mt-2 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Bouton de soumission */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring ring-blue-300 disabled:opacity-25 transition"
                >
                  {processing ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}