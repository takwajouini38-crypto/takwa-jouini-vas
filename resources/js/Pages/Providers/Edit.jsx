import React from "react";
import { useForm, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Edit({ fournisseur }) {
  // Initialisation avec les colonnes réelles de la base de données
  const { data, setData, errors, processing } = useForm({
    provider_name: fournisseur.provider_name || "",
    nationnalite: fournisseur.nationnalite || "",
    id_fiscale: fournisseur.id_fiscale || "",
    adresse: fournisseur.adresse || "",
  });

  function submit(e) {
    e.preventDefault();
    // CORRECTION : L'URL doit être /providers/
    router.post(`/providers/${fournisseur.id}`, {
      ...data,
      _method: "put",
    });
  }

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Modifier le Fournisseur : {fournisseur.provider_name}
        </h2>
      }
    >
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/providers" // CORRECTION URL
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à la liste
          </Link>
        </div>

        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <form onSubmit={submit} className="space-y-6">
              {/* Nom du fournisseur */}
              <div>
                <label htmlFor="provider_name" className="block text-sm font-medium text-gray-700">
                  Nom du fournisseur
                </label>
                <input
                  id="provider_name"
                  type="text"
                  value={data.provider_name}
                  onChange={(e) => setData("provider_name", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {errors.provider_name && <p className="mt-2 text-sm text-red-600">{errors.provider_name}</p>}
              </div>

              {/* Nationalité */}
              <div>
                <label htmlFor="nationnalite" className="block text-sm font-medium text-gray-700">
                  Nationalité
                </label>
                <select
                  id="nationnalite"
                  value={data.nationnalite}
                  onChange={(e) => setData("nationnalite", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Tunisienne">Tunisienne</option>
                  <option value="Étrangère">Étrangère</option>
                </select>
                {errors.nationnalite && <p className="mt-2 text-sm text-red-600">{errors.nationnalite}</p>}
              </div>

              {/* ID Fiscale */}
              <div>
                <label htmlFor="id_fiscale" className="block text-sm font-medium text-gray-700">
                  Identifiant Fiscal
                </label>
                <input
                  id="id_fiscale"
                  type="text"
                  value={data.id_fiscale}
                  onChange={(e) => setData("id_fiscale", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              {/* Adresse */}
              <div>
                <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <textarea
                  id="adresse"
                  value={data.adresse}
                  onChange={(e) => setData("adresse", e.target.value)}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Link
                  href="/providers" // CORRECTION URL
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-25"
                >
                  {processing ? "Modification..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}