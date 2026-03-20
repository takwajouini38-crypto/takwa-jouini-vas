import React from "react";
import { Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Edit({ service }) {
  const { data, setData, errors, processing } = useForm({
    nom_service: service.nom_service || "",
    nom_fournisseur: service.nom_fournisseur || "",
    numero_court: service.numero_court || "",
    keyword: service.keyword || "",
    type: service.type || "",
    prix: service.prix || "",
  });

  function submit(e) {
    e.preventDefault();
    router.post(`/services/${service.id}`, {
      ...data,
      _method: "put",
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Modifier le service
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
            <form onSubmit={submit} className="space-y-6">
              {/* Nom du service */}
              <div>
                <label htmlFor="nom_service" className="block text-sm font-medium text-gray-700">
                  Nom du service
                </label>
                <input
                  id="nom_service"
                  type="text"
                  value={data.nom_service}
                  onChange={(e) => setData("nom_service", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {errors.nom_service && <p className="mt-2 text-sm text-red-600">{errors.nom_service}</p>}
              </div>

              {/* Fournisseur */}
              <div>
                <label htmlFor="nom_fournisseur" className="block text-sm font-medium text-gray-700">
                  Fournisseur
                </label>
                <input
                  id="nom_fournisseur"
                  type="text"
                  value={data.nom_fournisseur}
                  onChange={(e) => setData("nom_fournisseur", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {errors.nom_fournisseur && <p className="mt-2 text-sm text-red-600">{errors.nom_fournisseur}</p>}
              </div>

              {/* Numéro court */}
              <div>
                <label htmlFor="numero_court" className="block text-sm font-medium text-gray-700">
                  Numéro court
                </label>
                <input
                  id="numero_court"
                  type="text"
                  value={data.numero_court}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d{0,7}$/.test(value)) setData("numero_court", value);
                  }}
                  maxLength={7}
                  pattern="\d{4,7}"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {data.numero_court.length > 7 && (
                  <p className="mt-2 text-sm text-red-600">
                    Le numéro court ne doit pas dépasser 7 chiffres.
                  </p>
                )}
                {errors.numero_court && <p className="mt-2 text-sm text-red-600">{errors.numero_court}</p>}
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                {errors.keyword && <p className="mt-2 text-sm text-red-600">{errors.keyword}</p>}
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {errors.type && <p className="mt-2 text-sm text-red-600">{errors.type}</p>}
              </div>

              {/* Prix */}
              <div>
                <label htmlFor="prix" className="block text-sm font-medium text-gray-700">
                  Prix
                </label>
                <input
                  id="prix"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={data.prix}
                  onChange={(e) => setData("prix", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {errors.prix && <p className="mt-2 text-sm text-red-600">{errors.prix}</p>}
              </div>

              {/* Bouton */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring ring-blue-300 disabled:opacity-25 transition"
                >
                  {processing ? "Modification..." : "Modifier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}