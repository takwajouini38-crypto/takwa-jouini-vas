import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function BizMainView({ auth, revenueByProvider = [], startDate, endDate }) {
    
    // Calcul du revenu total à partir des données réelles
    const totalRevenue = revenueByProvider.reduce((acc, curr) => acc + parseFloat(curr.total || 0), 0);
    
    // Formatage monétaire en TND
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', currency: 'TND', minimumFractionDigits: 3 
        }).format(val);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Business - TT" />
            
            <div className="py-6 bg-[#f0f4f8] min-h-screen font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- BANNIÈRE DE BIENVENUE (Dégradé Institutionnel TT) --- */}
                    <div className="bg-gradient-to-r from-[#1a4099] to-[#6c2da3] rounded-[2rem] p-8 text-white shadow-xl flex justify-between items-center border-b-8 border-[#122e6e]">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/20 p-1 rounded-md text-[10px] uppercase font-bold tracking-[0.2em]">Platform Monitoring</span>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Bienvenue, {auth.user.name}</h1>
                            <p className="text-blue-100/80 mt-1">Tableau de bord — Direction Centrale Business — VAS SMS+</p>
                        </div>
                        
                        <div className="hidden md:flex flex-col items-end">
                            <span className="bg-[#4ade80]/20 text-[#4ade80] px-4 py-1 rounded-full text-xs font-bold border border-[#4ade80]/30 flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-[#4ade80] animate-pulse"></span>
                                Système opérationnel
                            </span>
                            <p className="text-[10px] text-blue-100/40 mt-2 uppercase font-mono tracking-widest">Oracle 21c Warehouse</p>
                        </div>
                    </div>

                    {/* --- GRILLE DE STATISTIQUES (Bento Grid) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Carte : Revenu Total */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-4 border-[#1a4099] hover:shadow-lg transition-all transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Revenu Total</p>
                                <span className="text-[#1a4099] bg-blue-50 p-2 rounded-xl text-xl">💰</span>
                            </div>
                            <p className="text-3xl font-black text-[#1a4099]">{formatCurrency(totalRevenue)}</p>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Réel (TND)</span>
                            </div>
                        </div>

                        {/* Carte : Partenaires */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-4 border-[#6c2da3] hover:shadow-lg transition-all transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Partenaires</p>
                                <span className="text-[#6c2da3] bg-purple-50 p-2 rounded-xl text-xl">🏢</span>
                            </div>
                            <p className="text-3xl font-black text-slate-800">{revenueByProvider.length}</p>
                            <p className="mt-4 text-[10px] text-purple-500 font-bold uppercase tracking-widest">Fournisseurs VAS actifs</p>
                        </div>

                        {/* Carte : Période d'activité */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-4 border-slate-200 hover:shadow-lg transition-all transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Période</p>
                                <span className="text-slate-600 bg-slate-50 p-2 rounded-xl text-xl">📅</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-600 flex justify-between uppercase">
                                    <span>Du</span> <span className="text-slate-900">{startDate}</span>
                                </p>
                                <p className="text-xs font-bold text-slate-600 flex justify-between uppercase">
                                    <span>Au</span> <span className="text-slate-900">{endDate}</span>
                                </p>
                            </div>
                        </div>

                        {/* Carte : État de la Source */}
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border-l-4 border-emerald-400 hover:shadow-lg transition-all transform hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Source</p>
                                <span className="text-emerald-600 bg-emerald-50 p-2 rounded-xl text-xl">⚙️</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                <p className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Connecté</p>
                            </div>
                            <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Oracle Server</p>
                        </div>

                    </div>

                    {/* --- PIED DE PAGE --- */}
                    <div className="pt-8 flex flex-col items-center">
                        <div className="h-[1px] w-1/4 bg-slate-200 mb-4"></div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
                            Tunisie Télécom — PFE 2026
                        </p>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}