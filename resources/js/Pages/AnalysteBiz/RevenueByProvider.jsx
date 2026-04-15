import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function RevenueByProvider({ auth, providers, availableServices, revenueData, servicesDetail, xAxisKey, filters }) {
    
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#f43f5e', '#06b6d4'];

    // Fonction de mise à jour des filtres avec Inertia
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

    /**
     * Composant utilitaire pour afficher un message si aucune donnée n'est disponible
     */
    const EmptyState = ({ message = "Aucune donnée disponible pour cette période." }) => (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200 z-10">
            <p className="text-gray-400 text-sm font-medium italic">{message}</p>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Analyse par Fournisseur</h2>}
        >
            <Head title="Analyse Fournisseurs" />

            <div className="py-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* BARRE DE FILTRES */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-end gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Période du</label>
                            <input 
                                type="date" 
                                value={filters.start_date || ''} 
                                onChange={(e) => updateFilters({ start_date: e.target.value })} 
                                className="rounded-lg border-gray-300 text-sm focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Au</label>
                            <input 
                                type="date" 
                                value={filters.end_date || ''} 
                                onChange={(e) => updateFilters({ end_date: e.target.value })} 
                                className="rounded-lg border-gray-300 text-sm focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Fournisseur</label>
                            <select 
                                value={filters.provider || ''} 
                                onChange={(e) => updateFilters({ provider: e.target.value, service: '' })}
                                className="rounded-lg border-gray-300 text-sm w-48"
                            >
                                <option value="">Tous les fournisseurs</option>
                                {providers.map((p, i) => (
                                    <option key={i} value={p.nom_fournisseur}>{p.nom_fournisseur}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Service spécifique</label>
                            <select 
                                disabled={!filters.provider}
                                value={filters.service || ''} 
                                onChange={(e) => updateFilters({ service: e.target.value })}
                                className="rounded-lg border-gray-300 text-sm w-48 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <option value="">Tous les services</option>
                                {availableServices?.map((s, i) => (
                                    <option key={i} value={s.nom_service}>{s.nom_service}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* GRAPHIQUE PRINCIPAL */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-600 mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Revenus Globaux ({filters.start_date || '...'} au {filters.end_date || '...'})
                        </h3>
                        <div className="h-[350px] w-full relative">
                            {revenueData && revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="nom_fournisseur" tick={{fontSize: 11, fill: '#666'}} axisLine={false} />
                                        <YAxis tick={{fontSize: 11, fill: '#666'}} axisLine={false} />
                                        <Tooltip 
                                            cursor={{fill: '#f8fafc'}}
                                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            formatter={(val) => [`${val.toLocaleString('fr-FR', {minimumFractionDigits: 3})} TND`, 'Revenu']} 
                                        />
                                        <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={50}>
                                            {revenueData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState />
                            )}
                        </div>
                    </div>

                    {/* GRAPHIQUE DÉTAILLÉ (Conditionnel) */}
                    {filters.provider && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h3 className="text-sm font-bold text-gray-600 mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {filters.service 
                                    ? `Évolution quotidienne : ${filters.service}` 
                                    : `Détail des services : ${filters.provider}`}
                            </h3>
                            <div className="h-[350px] w-full relative">
                                {servicesDetail && servicesDetail.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={servicesDetail}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey={xAxisKey} 
                                                tick={{fontSize: 10, fill: '#666'}} 
                                                axisLine={false} 
                                                angle={-30} 
                                                textAnchor="end" 
                                                height={70} 
                                            />
                                            <YAxis tick={{fontSize: 11, fill: '#666'}} axisLine={false} />
                                            <Tooltip 
                                                cursor={{fill: '#f8fafc'}}
                                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                                formatter={(val) => [`${val.toLocaleString('fr-FR', {minimumFractionDigits: 3})} TND`, 'Revenu']} 
                                            />
                                            <Bar 
                                                dataKey="total" 
                                                fill="#10b981" 
                                                radius={[6, 6, 0, 0]} 
                                                barSize={xAxisKey === 'date_label' ? 20 : 40} 
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <EmptyState message="Aucun détail disponible pour cette sélection." />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}