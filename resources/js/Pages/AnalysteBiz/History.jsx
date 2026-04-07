import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react'; // Importation de router pour éviter l'erreur de méthode

export default function AlertHistory({ auth, alerts }) {

    const handleSaveMotif = (id, motifValue) => {
        // Utilisation de router.patch pour cibler précisément la route définie dans web.php
        router.patch(route('alerts.update', id), {
            motif: motifValue 
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Optionnel : ajouter une notification de succès ici
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Historique des Alertes" />
            <div className="p-8 bg-slate-50 min-h-screen">
                <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-slate-100">
                    <h1 className="text-xl font-black text-slate-800 mb-6">🚨 Historique des Alertes (Fraude & Majoration)</h1>
                    
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                <th className="pb-4">Service</th>
                                <th className="pb-4">Fournisseur</th>
                                <th className="pb-4 text-right">Moyenne (J-1)</th>
                                <th className="pb-4 text-right">Montant Majoré</th>
                                <th className="pb-4 text-center">Augmentation</th>
                                <th className="pb-4">Motif de l'Analyste</th>
                                <th className="pb-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {alerts.map((alert) => (
                                <tr key={alert.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="py-4 font-bold text-slate-700">{alert.service_name}</td>
                                    <td className="py-4 text-slate-500">{alert.provider}</td>
                                    <td className="py-4 text-right font-mono text-slate-500">{alert.avg_volume.toLocaleString()}</td>
                                    <td className="py-4 text-right font-mono font-bold text-red-500">{alert.current_volume.toLocaleString()}</td>
                                    <td className="py-4 text-center">
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black">
                                            +{alert.increase_pct}%
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <input 
                                            id={`motif-${alert.id}`}
                                            type="text"
                                            defaultValue={alert.motif}
                                            placeholder="Saisir un motif..."
                                            className="w-full bg-slate-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </td>
                                    <td className="py-4 text-center">
                                        <button 
                                            onClick={() => {
                                                const val = document.getElementById(`motif-${alert.id}`).value;
                                                handleSaveMotif(alert.id, val);
                                            }}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                                        >
                                            Enregistrer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}