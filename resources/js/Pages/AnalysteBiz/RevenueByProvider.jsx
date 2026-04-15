import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function RevenueByProvider({ auth, providers, availableServices, revenueData, servicesDetail, xAxisKey, filters }) {
    
    const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f43f5e'];

    const updateFilters = (newParams) => {
        router.get(route('analyste.providers'), {
            ...filters,
            ...newParams
        }, { 
            preserveState: true, 
            replace: true,
            preserveScroll: true 
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Analyse Granulaire par Fournisseur</h2>}
        >
            <Head title="Analyse Revenus" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* --- BARRE DE FILTRES --- */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-6">
                        
                        {/* 1. Fournisseur */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseur</label>
                            <select 
                                value={filters.provider || ''} 
                                onChange={(e) => updateFilters({ provider: e.target.value, service: '' })}
                                className="rounded-xl border-gray-200 text-sm font-bold text-slate-700 w-56 focus:ring-orange-500"
                            >
                                <option value="">Tous les fournisseurs</option>
                                {providers.map((p, i) => (
                                    <option key={i} value={p.nom_fournisseur}>{p.nom_fournisseur}</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Service (Conditionnel) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</label>
                            <select 
                                disabled={!filters.provider}
                                value={filters.service || ''} 
                                onChange={(e) => updateFilters({ service: e.target.value })}
                                className="rounded-xl border-gray-200 text-sm font-bold text-slate-700 w-56 disabled:bg-slate-50 disabled:text-slate-300"
                            >
                                <option value="">Tous les services</option>
                                {availableServices?.map((s, i) => (
                                    <option key={i} value={s.nom_service}>{s.nom_service}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Granularité (Maintenant en Select) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analyse par</label>
                            <select 
                                value={filters.granularity || 'mois'} 
                                onChange={(e) => updateFilters({ granularity: e.target.value })}
                                className="rounded-xl border-gray-200 text-sm font-bold text-slate-700 w-40 focus:ring-orange-500"
                            >
                                <option value="jour">Jour</option>
                                <option value="mois">Mois</option>
                                <option value="periode">Période Précise</option>
                            </select>
                        </div>

                        {/* 4. Dates */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Période</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="date" 
                                    value={filters.start_date} 
                                    onChange={(e) => updateFilters({ start_date: e.target.value })} 
                                    className="rounded-xl border-gray-200 text-xs font-bold text-slate-600"
                                />
                                <input 
                                    type="date" 
                                    value={filters.end_date} 
                                    onChange={(e) => updateFilters({ end_date: e.target.value })} 
                                    className="rounded-xl border-gray-200 text-xs font-bold text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- GRAPHIQUE 1 : VUE GLOBALE --- */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-6 italic">
                            Répartition par Fournisseur ({filters.start_date} au {filters.end_date})
                        </h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="nom_fournisseur" tick={{fontSize: 10, fontWeight: 'bold'}} axisLine={false} />
                                    <YAxis tick={{fontSize: 10}} axisLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="total" radius={[5, 5, 0, 0]} barSize={45}>
                                        {revenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* --- GRAPHIQUE 2 : DÉTAIL DYNAMIQUE --- */}
                    {filters.provider && (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in duration-500">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-6 italic">
                                {filters.service 
                                    ? `Évolution ${filters.granularity} : ${filters.service}` 
                                    : `Analyse des Services : ${filters.provider}`}
                            </h3>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={servicesDetail}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey={xAxisKey} 
                                            tick={{fontSize: 10, fontWeight: 'bold'}} 
                                            axisLine={false} 
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                        />
                                        <YAxis tick={{fontSize: 10}} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`${parseFloat(value).toFixed(3)} TND`, 'Revenu']}
                                        />
                                        <Bar dataKey="total" fill={filters.service ? "#10b981" : "#3b82f6"} radius={[5, 5, 0, 0]} barSize={35} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}