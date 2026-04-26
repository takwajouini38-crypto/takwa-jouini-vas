import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function AlertHistory({ auth, alerts }) {

   const handleSaveMotif = (id, motifValue) => {
    // On utilise POST mais on ajoute _method: 'PATCH' pour le spoofing Laravel
    router.post(route('alerts.update', id), {
        _method: 'PATCH', 
        motif: motifValue 
    }, {
        preserveScroll: true,
        onSuccess: () => {
            // Optionnel : notification de succès
        }
    });
};

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Historique des Alertes - TT" />
            
            <div className="py-6 bg-[#F9F9FF] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    
                    {/* Header Compact Style MSISDN */}
                    <div className="bg-gradient-to-r from-[#6A67FC] to-[#807DFF] rounded-2xl p-5 text-white shadow-md border-b-4 border-[#534FDB]">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <span className="p-1.5 bg-white/10 rounded-lg text-lg">🚨</span>
                                    Gestion des Alertes
                                </h1>
                                <p className="text-white/80 text-[10px] font-medium uppercase tracking-[0.2em] mt-0.5 ml-9">
                                    Revenue Assurance & Détection de Fraude
                                </p>
                            </div>
                            <div className="bg-black/15 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                    Seuil de détection : +20% (vs Moy. 7j)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Table des Résultats */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBFF] overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F9F9FF] text-[10px] uppercase font-black tracking-widest text-[#6A67FC] border-b border-[#EBEBFF]">
                                    <th className="p-4 pl-6">Service / Fournisseur</th>
                                    <th className="p-4 text-right">Moyenne (7j)</th>
                                    <th className="p-4 text-right">Volume Actuel</th>
                                    <th className="p-4 text-center">Variation</th>
                                    <th className="p-4">Motif d'analyse</th>
                                    <th className="p-4 pr-6 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-50">
                                {alerts.map((alert) => (
                                    <tr key={alert.id} className="hover:bg-[#EBEBFF]/20 transition-colors group">
                                        <td className="p-4 pl-6">
                                            <div className="font-bold text-slate-700 group-hover:text-[#6A67FC]">{alert.service_name}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">{alert.provider}</div>
                                        </td>
                                        <td className="p-4 text-right font-mono text-slate-500 text-xs">
                                            {alert.avg_volume.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-red-500 text-xs">
                                            {alert.current_volume.toLocaleString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black border border-red-100">
                                                +{alert.increase_pct}%
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <input 
                                                id={`motif-${alert.id}`}
                                                type="text"
                                                defaultValue={alert.motif}
                                                placeholder="Saisir la cause..."
                                                className="w-full bg-slate-50 border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-[#6A67FC] focus:border-[#6A67FC] transition-all"
                                            />
                                        </td>
                                        <td className="p-4 pr-6 text-center">
                                            <button 
                                                onClick={() => {
                                                    const val = document.getElementById(`motif-${alert.id}`).value;
                                                    handleSaveMotif(alert.id, val);
                                                }}
                                                className="bg-[#6A67FC] hover:bg-[#534FDB] text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all shadow-sm active:scale-95"
                                            >
                                                Valider
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {alerts.length === 0 && (
                            <div className="p-20 text-center">
                                <div className="text-4xl mb-3 opacity-20">✅</div>
                                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aucune anomalie détectée</p>
                            </div>
                        )}
                    </div>

                    <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em] pt-2">
                        Direction Revenue Assurance — Tunisie Télécom
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}