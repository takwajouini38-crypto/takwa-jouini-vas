import React, { useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { toPng } from 'html-to-image';

export default function RevenueByProvider({ auth, providers, availableServices, revenueData, servicesDetail, xAxisKey, filters }) {
    
    const mainChartRef = useRef(null);
    const detailChartRef = useRef(null);
    const marketShareChartRef = useRef(null);

    /**
     * Génère une couleur unique et stable à partir d'une chaîne de caractères
     */
    const getServiceColor = (str) => {
        if (!str) return '#3b82f6';
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash % 360);
        return `hsl(${h}, 65%, 55%)`; 
    };

    const exportAsPng = (ref, filename) => {
        if (ref.current === null) return;
        toPng(ref.current, { 
            backgroundColor: '#ffffff',
            cacheBust: true,
            style: { padding: '20px' }
        })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `${filename}_${new Date().getTime()}.png`;
            link.href = dataUrl;
            link.click();
        })
        .catch((err) => console.error(err));
    };

    const updateFilters = (newParams) => {
        router.get(route('analyste.providers'), {
            ...filters,
            ...newParams
        }, { preserveState: true, replace: true, preserveScroll: true });
    };

    // Calculer les parts de marché à partir des revenus
    const calculateMarketShares = () => {
        if (!revenueData || revenueData.length === 0) return [];
        
       const totalRevenue = revenueData.reduce((sum, item) => sum + Number(item.total || 0), 0);
        
        return revenueData.map(item => ({
            name: item.nom_fournisseur,
            value: item.total || 0,
            percentage: totalRevenue > 0 ? ((item.total / totalRevenue) * 100).toFixed(1) : 0
        })).sort((a, b) => b.value - a.value);
    };

    const marketShareData = calculateMarketShares();

    // Palette de couleurs personnalisée pour le camembert
    const pieChartColors = [
        '#10b981', // vert (EntertainmentHub)
        '#3b82f6', // bleu (FunMobile)
        '#8b5cf6', // violet (Healthservices)
        '#06b6d4', // cyan (MediaPlus)
        '#f97316', // orange (NextContent)
        '#1e3a8a', // bleu foncé (PlaySMS)
        '#14b8a6', // teal (SmartContent)
        '#ec4899', // rose (SportNews)
        '#6b7280', // gris (mediaPlus)
        '#a16207'  // marron (sami fehri)
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-2 shadow-lg rounded-lg border border-gray-200 text-xs">
                    <p className="font-semibold text-gray-800">{data.name}</p>
                    <p className="text-gray-600">
                        Revenu: {data.value.toLocaleString('fr-FR', {minimumFractionDigits: 0})} TND
                    </p>
                    <p className="font-medium text-blue-600">
                        Part: {data.percentage}%
                    </p>
                </div>
            );
        }
        return null;
    };

    // Trier les données pour l'histogramme (du plus grand au plus petit)
    const sortedRevenueData = [...revenueData].sort((a, b) => b.total - a.total);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Analyse des Revenus - Tunisie Télécom</h2>}
        >
            <Head title="Analyse Fournisseurs" />

            <div className="py-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* BARRE DE FILTRES */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-end gap-6">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase text-gray-400">Période du</label>
                            <input type="date" value={filters.start_date || ''} onChange={(e) => updateFilters({ start_date: e.target.value })} className="rounded-lg border-gray-300 text-sm focus:ring-blue-500"/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase text-gray-400">Au</label>
                            <input type="date" value={filters.end_date || ''} onChange={(e) => updateFilters({ end_date: e.target.value })} className="rounded-lg border-gray-300 text-sm focus:ring-blue-500"/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase text-gray-400">Fournisseur</label>
                            <select value={filters.provider || ''} onChange={(e) => updateFilters({ provider: e.target.value, service: '' })} className="rounded-lg border-gray-300 text-sm w-48">
                                <option value="">Tous les fournisseurs</option>
                                {providers.map((p, i) => <option key={i} value={p.nom_fournisseur}>{p.nom_fournisseur}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase text-gray-400">Service</label>
                            <select disabled={!filters.provider} value={filters.service || ''} onChange={(e) => updateFilters({ service: e.target.value })} className="rounded-lg border-gray-300 text-sm w-48 disabled:bg-gray-100">
                                <option value="">Tous les services</option>
                                {availableServices?.map((s, i) => <option key={i} value={s.service_name}>{s.service_name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* CARTE REVENU TOTAL */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">
                                    Revenu Total
                                </p>
                                <p className="text-white text-2xl font-bold mt-1">
                                    {marketShareData.reduce((sum, item) => sum + item.value, 0).toLocaleString('fr-FR', {minimumFractionDigits: 0})} TND
                                </p>
                            </div>
                            <div className="bg-white/20 rounded-full p-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* DEUX GRAPHIQUES CÔTE À CÔTE */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* GRAPHIQUE 1 : PARTS DE MARCHÉ (CAMBEMBERT) */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Parts de Marché (%)
                                </h3>
                                <button onClick={() => exportAsPng(marketShareChartRef, 'parts_marche')} className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md hover:bg-green-100 transition-colors">
                                    📥 PNG
                                </button>
                            </div>
                            <div ref={marketShareChartRef} className="h-[300px] w-full bg-white">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={marketShareData}
                                            cx="50%"
                                            cy="45%"
                                            labelLine={false}
                                            label={({ name, percent }) => percent > 0.03 ? `${name} (${(percent * 100).toFixed(1)}%)` : ''}
                                            outerRadius={90}
                                            innerRadius={40}
                                            fill="#8884d8"
                                            dataKey="value"
                                            paddingAngle={2}
                                        >
                                            {marketShareData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={pieChartColors[index % pieChartColors.length]}
                                                    stroke="#fff"
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            height={36}
                                            wrapperStyle={{ fontSize: '10px' }}
                                            layout="horizontal"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            {marketShareData.length > 0 && (
                                <div className="mt-1 pt-1 border-t border-gray-100 text-center">
                                    <p className="text-[10px] text-gray-500">
                                        Revenu total: {marketShareData.reduce((sum, item) => sum + item.value, 0).toLocaleString('fr-FR', {minimumFractionDigits: 0})} TND
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* GRAPHIQUE 2 : RÉPARTITION PAR FOURNISSEUR (HISTOGRAMME VERTICAL) */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Répartition par Fournisseur
                                </h3>
                                <button onClick={() => exportAsPng(mainChartRef, 'revenus_fournisseurs')} className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">
                                    📥 PNG
                                </button>
                            </div>
                            <div ref={mainChartRef} className="h-[300px] w-full bg-white">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sortedRevenueData} margin={{ top: 10, right: 10, left: 10, bottom: 50 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis 
                                            dataKey="nom_fournisseur" 
                                            tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} 
                                            axisLine={false}
                                            tickLine={false}
                                            height={60}
                                            interval={0}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 10 }} 
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => {
                                                if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
                                                if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                                                return val;
                                            }}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: '#f3f4f6' }} 
                                            formatter={(val) => [`${val.toLocaleString('fr-FR', {minimumFractionDigits: 0})} TND`, 'Revenu']}
                                            contentStyle={{ fontSize: '11px' }}
                                        />
                                        <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={40}>
                                            {sortedRevenueData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getServiceColor(entry.nom_fournisseur)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* GRAPHIQUE 3 : DÉTAIL SERVICES OU ÉVOLUTION JOURNALIÈRE */}
                    {filters.provider && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                    {filters.service ? `Évolution Journalière : ${filters.service}` : `Détail des Services : ${filters.provider}`}
                                </h3>
                                <button onClick={() => exportAsPng(detailChartRef, `detail_${filters.provider}`)} className="text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                                    📥 Exporter PNG
                                </button>
                            </div>
                            <div ref={detailChartRef} className="h-[350px] w-full bg-white">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={servicesDetail}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey={xAxisKey} tick={{fontSize: 10}} axisLine={false} angle={-30} textAnchor="end" height={60} />
                                        <YAxis tick={{fontSize: 11}} axisLine={false} />
                                        <Tooltip cursor={{fill: '#f8fafc'}} formatter={(val) => [`${val.toLocaleString('fr-FR', {minimumFractionDigits: 3})} TND`, 'Revenu']} />
                                        <Bar dataKey="total" radius={[4, 4, 0, 0]} barSize={xAxisKey === 'date_label' ? 20 : 40}>
                                            {servicesDetail.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-det-${index}`} 
                                                    fill={
                                                        filters.service 
                                                            ? getServiceColor(filters.service) 
                                                            : getServiceColor(entry.nom_service)
                                                    } 
                                                />
                                            ))}
                                        </Bar>
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