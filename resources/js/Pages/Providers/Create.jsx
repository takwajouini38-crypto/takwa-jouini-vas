import React from "react";
import { useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
// Import de l'icône ArrowLeft
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    provider_name: "",
    nationnalite: "Tunisienne",
    id_fiscale: "",
    adresse: "",
  });

  function submit(e) {
  e.preventDefault();

  // Regex : 8 chiffres suivis d'une lettre majuscule
  const regexIdFiscal = /^[0-9]{8}[A-Z]$/;

  if (!regexIdFiscal.test(data.id_fiscale)) {
    // On peut utiliser le système d'erreur d'Inertia manuellement 
    // ou simplement laisser le "pattern" HTML5 bloquer le formulaire.
    alert("Veuillez respecter le format de l'identifiant fiscal (ex: 12345678A)");
    return;
  }

  post("/providers");
}
  return (
    <AuthenticatedLayout 
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Ajouter un Fournisseur
        </h2>
      }
    >
      <div className="max-w-2xl mx-auto py-6 sm:px-6 lg:px-8">
        
        {/* SECTION AJOUTÉE : Bouton de retour au-dessus du formulaire */}
        <div className="mb-4">
          <Link
            href="/providers"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Retour à la liste
          </Link>
        </div>

        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Informations du Partenaire
            </h2>

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
                  required
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 sm:text-sm ${
                    errors.provider_name ? "border-red-500" : ""
                  }`}
                />
                {errors.provider_name && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">{errors.provider_name}</p>
                )}
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
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Tunisienne">Tunisienne</option>
                  <option value="Étrangère">Étrangère</option>
                </select>
              </div>

            {/* ID Fiscale */}
<div>
  <label htmlFor="id_fiscale" className="block text-sm font-medium text-gray-700">
    Identifiant Fiscal (ex: 12345678A)
  </label>
  <input
    id="id_fiscale"
    type="text"
    value={data.id_fiscale}
    onChange={(e) => setData("id_fiscale", e.target.value.toUpperCase())} // Force les majuscules
    required
    // Validation native HTML5 : 8 chiffres suivis d'une lettre
    pattern="^[0-9]{8}[A-Z]$"
    title="Le format doit être : 8 chiffres suivis d'une lettre majuscule (ex: 12345678A)"
    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 sm:text-sm ${
      errors.id_fiscale ? "border-red-500" : ""
    }`}
  />
  <p className="mt-1 text-xs text-gray-500">Format requis : 8 chiffres + 1 lettre majuscule</p>
  {errors.id_fiscale && (
    <p className="mt-2 text-sm text-red-600 font-semibold">{errors.id_fiscale}</p>
  )}
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
                  required
                  rows="3"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 sm:text-sm ${
                    errors.adresse ? "border-red-500" : ""
                  }`}
                />
                {errors.adresse && (
                  <p className="mt-2 text-sm text-red-600 font-semibold">{errors.adresse}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Link 
                  href="/providers" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition"
                >
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring ring-blue-300 disabled:opacity-50 transition"
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