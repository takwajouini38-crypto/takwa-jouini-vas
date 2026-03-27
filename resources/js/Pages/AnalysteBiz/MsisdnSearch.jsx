import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function MsisdnSearch({ auth, results, filters }) {
    const [msisdn, setMsisdn] = useState(filters?.msisdn || '');

    const handleSearch = (e) => {
        e.preventDefault();
        // Appel de la route définie dans votre web.php
        router.get(route('analyste.api.search'), { msisdn }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Recherche MSISDN - TT" />
            
            <div className="py-8 bg-[#f4f7fe] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header Dégradé TT */}
                    <div className="bg-gradient-to-r from-[#1a4099] to-[#6c2da3] rounded-[2rem] p-8 text-white shadow-lg border-b-4 border-[#122e6e]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter">INVESTIGATION MSISDN</h1>
                                <p className="text-blue-100 text-xs mt-1 font-bold uppercase tracking-widest">
                                    Data Warehouse Oracle 21c — Tunisie Télécom
                                </p>
                            </div>
                            <div className="hidden md:block bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
                                <p className="text-[10px] uppercase font-bold text-blue-200">Statut Système</p>
                                <p className="text-sm font-bold">● Connecté au serveur</p>
                            </div>
                        </div>
                    </div>

                    {/* Barre de Recherche Bento */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">
                                    Saisir le numéro (B_MSISDN)
                                </label>
                                <input 
                                    type="text" 
                                    value={msisdn}
                                    onChange={(e) => setMsisdn(e.target.value)}
                                    placeholder="Ex: 21696..."
                                    className="w-full h-14 rounded-2xl border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#1a4099] focus:bg-white transition-all font-bold text-gray-700"
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="h-14 bg-[#1a4099] hover:bg-[#122e6e] text-white px-10 rounded-2xl font-black shadow-lg shadow-blue-100 transition-all uppercase text-sm"
                            >
                                Rechercher
                            </button>
                        </form>
                    </div>

                    {/* Tableau des Résultats */}
                    <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
                        <div className="bg-gray-50/50 px-8 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Transactions Récentes (CDR)</h2>
                            {results && <span className="text-xs font-bold text-[#1a4099]">{results.length} lignes extraites</span>}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-50">
                                <thead>
                                    <tr className="bg-white">
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Date & Heure</th>
                                        <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase">Service (Keyword)</th>
                                        <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase">Revenu (TND)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 bg-white">
                                    {results && results.length > 0 ? results.map((row, i) => (
                                        <tr key={i} className="hover:bg-blue-50/30 transition-all group">
                                            <td className="px-8 py-4 text-sm font-mono text-gray-500 italic">
                                                {row.date} <span className="text-[10px] opacity-50 ml-2">{row.hour}h</span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-sm font-bold text-gray-800 group-hover:text-[#1a4099]">{row.keyword}</span>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <span className="text-sm font-black text-[#1a4099]">{row.amount}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-20 text-center">
                                                <p className="text-sm font-bold text-gray-300 uppercase tracking-[0.3em]">Aucune transaction trouvée</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <footer className="text-center pb-8">
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em]">
                            Tunisie Télécom — Direction Centrale Business — PFE 2026
                        </p>
                    </footer>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}