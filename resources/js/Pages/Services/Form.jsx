import React from 'react';
import { useForm } from '@inertiajs/react';
export default function Form({ service = null }) {
    const { data, setData, post, put, processing, errors } = useForm({
        nom_fournisseur: service?.nom_fournisseur ?? '',
        nom_service: service?.nom_service ?? '',
        numero_court: service?.numero_court ?? '',
        keyword: service?.keyword ?? '',
        type: service?.type ?? '',
        prix: service?.prix ?? '',
    });

    // Mise à jour du formulaire si le service change (utile si la key ne suffit pas)
   /* useEffect(() => {
        if (service) {
            setData({
                nom_service: service.nom_service ?? '',
                nom_fournisseur: service.nom_fournisseur ?? '',
                numero_court: service.numero_court ?? '',
                keyword: service.keyword ?? '',
                type: service.type ?? '',
                prix: service.prix ?? '',
            });
        }
    }, [service]);*/

   const submit = (e) => {
    e.preventDefault();
    console.log('ID envoyé:', service.id); // doit afficher 1
    if (service) {
        put(route('services.update', service.id));
    } else {
        post(route('services.store'));
    }
};
    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nom du fournisseur</label>
                <input
                    type="text"
                    value={data.nom_fournisseur}
                    onChange={(e) => setData('nom_fournisseur', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.nom_fournisseur && <div className="text-red-500 text-sm">{errors.nom_fournisseur}</div>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Nom du service</label>
                <input
                    type="text"
                    value={data.nom_service}
                    onChange={(e) => setData('nom_service', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.nom_service && <div className="text-red-500 text-sm">{errors.nom_service}</div>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Numéro court</label>
                <input
                    type="text"
                    value={data.numero_court}
                    onChange={(e) => setData('numero_court', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.numero_court && <div className="text-red-500 text-sm">{errors.numero_court}</div>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Keyword</label>
                <input
                    type="text"
                    value={data.keyword}
                    onChange={(e) => setData('keyword', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.keyword && <div className="text-red-500 text-sm">{errors.keyword}</div>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input
                    type="text"
                    value={data.type}
                    onChange={(e) => setData('type', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.type && <div className="text-red-500 text-sm">{errors.type}</div>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Prix</label>
                <input
                    type="number"
                    step="0.01"
                    value={data.prix}
                    onChange={(e) => setData('prix', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
                {errors.prix && <div className="text-red-500 text-sm">{errors.prix}</div>}
            </div>

            <div>
                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    {service ? 'Mettre à jour' : 'Créer'}
                </button>
            </div>
        </form>
    );
}