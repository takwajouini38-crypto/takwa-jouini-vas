import React, { useRef, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell, PieChart, Pie, Legend, 
    Line, ComposedChart, ReferenceLine, LabelList
} from 'recharts';
import { toPng } from 'html-to-image';
import { useState } from 'react'; // Ajoute useState ici
import axios from 'axios';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';

export default function RevenueByProvider({ auth, providers, availableServices, revenueData, servicesDetail, xAxisKey, filters, hasData }) {
    
    const pieChartRef = useRef(null);
    const topRevenueRef = useRef(null);
    const detailChartRef = useRef(null);

    const DISTINCT_COLORS = [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
        '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
    ];

    const getFixedColor = (index) => DISTINCT_COLORS[index % DISTINCT_COLORS.length];

    const globalTotal = useMemo(() => {
        return revenueData?.reduce((sum, item) => sum + Number(item.total || 0), 0) || 0;
    }, [revenueData]);

    const marketShareData = useMemo(() => {
        if (!revenueData || revenueData.length === 0) return [];
        return revenueData.map(item => ({
            name: item.nom_fournisseur,
            value: Number(item.total) || 0,
            percentage: globalTotal > 0 ? ((item.total / globalTotal) * 100).toFixed(1) : 0
        })).sort((a, b) => b.value - a.value);
    }, [revenueData, globalTotal]);

    const enrichedDetails = useMemo(() => {
        if (!servicesDetail) return [];
        return servicesDetail.map((item, index, array) => {
            if (xAxisKey !== 'date_label') return { ...item, tendance: null };
            const windowSize = 7;
            const start = Math.max(0, index - (windowSize - 1));
            const subset = array.slice(start, index + 1);
            const avg = subset.reduce((sum, curr) => sum + Number(curr.total), 0) / subset.length;
            return { ...item, tendance: parseFloat(avg.toFixed(2)) };
        });
    }, [servicesDetail, xAxisKey]);
    // États pour l'IA
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAiModal, setShowAiModal] = useState(false);

    // Fonction pour appeler ton contrôleur AnalysteBiz/AiAnalysisController
    const handleAiAnalysis = async (data, context) => {
        setIsAnalyzing(true);
        setShowAiModal(true);
        setAiAnalysis("L'IA analyse les flux de revenus VAS pour Tunisie Télécom...");

        try {
            const response = await axios.post(route('ai.analyze'), {
                chartData: data,
                context: context
            });
            setAiAnalysis(response.data.analysis);
        } catch (error) {
            setAiAnalysis("Erreur : Impossible de joindre l'IA Groq. Vérifiez votre connexion ou votre clé API.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Composant Bouton réutilisable
    const AiBtn = ({ data, context }) => (
        <button 
            onClick={() => handleAiAnalysis(data, context)}
            className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold hover:bg-indigo-100 border border-indigo-200 transition-all shadow-sm"
        >
            <SparklesIcon className="h-3 w-3" /> ANALYSE IA
        </button>
    );

    const exportAsPng = (ref, filename) => {
        if (!ref.current) return;
        toPng(ref.current, { backgroundColor: '#ffffff', cacheBust: true, style: { padding: '20px' } })
        .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = dataUrl;
            link.click();
        });
    };

    const updateFilters = (newParams) => {
        router.get(route('analyste.providers'), { ...filters, ...newParams }, { preserveState: true, replace: true, preserveScroll: true });
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-100 text-xs">
                    <p className="font-bold text-gray-800 mb-1">{data.service_name || data.nom_fournisseur || data.date_label}</p>
                    <p className="text-blue-600 font-semibold">{Number(payload[0].value).toLocaleString('fr-FR')} TND</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 italic">Monitoring VAS - Tunisie Télécom</h2>}
        >
            <Head title="Analyse Fournisseurs" />

            <div className="py-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* BANNIÈRE TOTAL */}
                    <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-xl p-6 shadow-lg text-white">
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Revenu Total Global</p>
                        <h2 className="text-3xl font-black">{globalTotal.toLocaleString('fr-FR')} <span className="text-lg font-light">TND</span></h2>
                    </div>

                    {/* FILTRES RÉTABLIS */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-end gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Période</label>
                            <div className="flex items-center gap-2">
                                <input type="date" value={filters.start_date || ''} onChange={(e) => updateFilters({ start_date: e.target.value })} className="rounded-lg border-gray-300 text-sm h-9"/>
                                <span className="text-gray-400">→</span>
                                <input type="date" value={filters.end_date || ''} onChange={(e) => updateFilters({ end_date: e.target.value })} className="rounded-lg border-gray-300 text-sm h-9"/>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Fournisseur</label>
                            <select value={filters.provider || ''} onChange={(e) => updateFilters({ provider: e.target.value, service: '' })} className="rounded-lg border-gray-300 text-sm h-9 w-44">
                                <option value="">Tous les fournisseurs</option>
                                {providers?.map((p, i) => <option key={i} value={p.nom_fournisseur}>{p.nom_fournisseur}</option>)}
                            </select>
                        </div>
                        {/* FILTRE SERVICE RÉ-AJOUTÉ ICI */}
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Service spécifique</label>
                            <select 
                                disabled={!filters.provider} 
                                value={filters.service || ''} 
                                onChange={(e) => updateFilters({ service: e.target.value })} 
                                className="rounded-lg border-gray-300 text-sm h-9 w-48 disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="">Tous les services</option>
                                {availableServices?.map((s, i) => <option key={i} value={s.service_name}>{s.service_name}</option>)}
                            </select>
                        </div>
                    </div>

                    {hasData && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* PIE CHART */}
                                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-gray-400 uppercase">
                                        <span>Parts de marché</span>
                                    
                                             <div className="flex items-center gap-2">
                                           <AiBtn data={marketShareData} context="Parts de marché des fournisseurs VAS" />
                                        <button onClick={() => exportAsPng(pieChartRef, 'parts_marche')} className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">PNG</button>
                                    </div>
                                    </div>
                                    <div ref={pieChartRef} className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={marketShareData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" labelLine={false} label={({percentage}) => percentage > 5 ? `${percentage}%` : ''}>
                                                    {marketShareData.map((entry, index) => <Cell key={index} fill={getFixedColor(index)} />)}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
{/* TOP BAR CHART - Revenus par Fournisseur */}
<div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
    <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-gray-400 uppercase">
        <span>Revenus par Fournisseur (TND)</span>
        <div className="flex items-center gap-2">
            <AiBtn data={revenueData} context="Classement des revenus par fournisseur" />
            <button onClick={() => exportAsPng(topRevenueRef, 'top_revenus')} className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">PNG</button>
        </div>
    </div>
    
    <div ref={topRevenueRef} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...revenueData].sort((a,b) => b.total - a.total)} layout="vertical" margin={{ right: 60 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="nom_fournisseur" type="category" width={100} tick={{fontSize: 10}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={15}>
                    {revenueData.map((entry, index) => <Cell key={index} fill={getFixedColor(index)} />)}
                    <LabelList dataKey="total" position="right" formatter={(v) => `${Math.round(v).toLocaleString()} TND`} style={{fontSize: '10px', fontWeight: 'bold', fill: '#444'}} />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
</div>
                            </div>

                            {/* GRAPHIQUE DE DÉTAIL (SERVICE OU DATE) */}
                            {filters.provider && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-center mb-6">
                                      <h3 className="text-lg font-bold text-gray-800">
                                          Détail : <span className="text-blue-600 font-black">{filters.service || filters.provider}</span>
                                        </h3>
                                      {/* AJOUT ICI */}
                                       <div className="flex items-center gap-3">
                                        <AiBtn data={enrichedDetails} context={`Évolution détaillée pour ${filters.service || filters.provider}`} />
                                          <button onClick={() => exportAsPng(detailChartRef, 'evolution_details')} className="text-xs bg-gray-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-black transition-all">EXPORTER PNG</button>
                                             </div>
                                                   </div>
                                    <div ref={detailChartRef} className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={enrichedDetails} margin={{ top: 20, right: 30, bottom: 40 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey={xAxisKey} tick={{fontSize: 10}} angle={-45} textAnchor="end" />
                                                <YAxis tick={{fontSize: 10}} tickFormatter={(v) => `${v} TND`} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar name="Revenu" dataKey="total" radius={[4, 4, 0, 0]} barSize={xAxisKey === 'date_label' ? 12 : 40}>
                                                    {enrichedDetails.map((entry, index) => (
                                                        <Cell key={index} fill={xAxisKey === 'date_label' ? '#3b82f6' : getFixedColor(index + 2)} />
                                                    ))}
                                                    <LabelList dataKey="total" position="top" formatter={(v) => `${Math.round(v).toLocaleString()} TND`} style={{fontSize: '10px', fill: '#666'}} />
                                                </Bar>
                                                {xAxisKey === 'date_label' && (
                                                    <Line type="monotone" dataKey="tendance" stroke="#f59e0b" strokeWidth={3} dot={false} />
                                                )}
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {/* COPIER CE BLOC JUSTE AVANT </AuthenticatedLayout> */}
              {showAiModal && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-yellow-300" />
                    <h3 className="font-bold text-sm uppercase">Analyse IA - Tunisie Télécom</h3>
                </div>
                <button onClick={() => setShowAiModal(false)}><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="p-6">
                {isAnalyzing ? (
                    <div className="flex flex-col items-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-indigo-600 text-sm italic">Analyse des données en cours...</p>
                    </div>
                ) : (
                    <div className="text-gray-700 text-sm whitespace-pre-line bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                        {aiAnalysis}
                    </div>
                )}
                <div className="mt-4 flex justify-end">
                    <button onClick={() => setShowAiModal(false)} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold text-xs uppercase">Fermer</button>
                </div>
            </div>
        </div>
    </div>
)}
        </AuthenticatedLayout>
    );
}