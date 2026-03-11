import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ services }) {
    const { flash } = usePage().props;

    // DEBUG : afficher la structure des données dans la console
    console.log('Données reçues (services) :', services);
    console.log('Premier élément :', services.data?.[0]);

    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-semibold">Gestion des services</h1>
                        <Link
                            href={route('services.create')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Nouveau service
                        </Link>
                    </div>

                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                            {flash.success}
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro court</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {services.data && services.data.map((service) => {
                                    // Récupération de l'ID (peut être en majuscules ou minuscules)
                                    const serviceId = service.ID ?? service.id;
                                    const fournisseur = service.NOM_FOURNISSEUR ?? service.nom_fournisseur ?? '';
                                    const nomService = service.NOM_SERVICE ?? service.nom_service ?? '';
                                    const numeroCourt = service.NUMERO_COURT ?? service.numero_court ?? '';
                                    const keyword = service.KEYWORD ?? service.keyword ?? '';
                                    const type = service.TYPE ?? service.type ?? '';
                                    const prix = service.PRIX ?? service.prix ?? '';

                                    return (
                                        <tr key={serviceId}>
                                            {/* La colonne ID n'est plus affichée */}
                                            <td className="px-6 py-4 whitespace-nowrap">{fournisseur}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{nomService}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{numeroCourt}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{keyword}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{type}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{prix}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {serviceId && (
                                                    <>
                                                        <Link
                                                            href={route('services.edit', serviceId)}
                                                            className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                        >
                                                            Modifier
                                                        </Link>
                                                        <Link
                                                            href={route('services.destroy', serviceId)}
                                                            method="delete"
                                                            as="button"
                                                            className="text-red-600 hover:text-red-900"
                                                            onClick={(e) => {
                                                                if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                        >
                                                            Supprimer
                                                        </Link>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination simplifiée avec Précédent / Suivant */}
                        <div className="flex justify-between items-center px-6 py-4">
                            {services.prev_page_url ? (
                                <Link
                                    href={services.prev_page_url}
                                    preserveState
                                    preserveScroll
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    ← Précédent
                                </Link>
                            ) : (
                                <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                                    ← Précédent
                                </span>
                            )}

                            <span className="text-sm text-gray-700">
                                Page {services.current_page} sur {services.last_page}
                            </span>

                            {services.next_page_url ? (
                                <Link
                                    href={services.next_page_url}
                                    preserveState
                                    preserveScroll
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    Suivant →
                                </Link>
                            ) : (
                                <span className="px-4 py-2 bg-gray-100 text-gray-400 rounded cursor-not-allowed">
                                    Suivant →
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}