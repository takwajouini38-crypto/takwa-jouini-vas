import React, { useRef, useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import html2canvas from 'html2canvas';

export default function RevenueByProvider({ auth, data, startDate, endDate, granularity }) {
    const chartRef = useRef(null);
    const detailRef = useRef(null);
    
    // Initialisation avec le premier fournisseur de la liste
    const [selectedProvider, setSelectedProvider] = useState(data.length > 0 ? data[0].nom_fournisseur : null);

    const COLORS = [
        '#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', 
        '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1'
    ];

    const formatCurrency = (val) => 
        new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'TND',
            maximumFractionDigits: 0 
        }).format(val);

    const serviceData = useMemo(() => {
        if (!selectedProvider) return [];
        const provider = data.find(p => p.nom_fournisseur === selectedProvider);
        return provider?.services || [];
    }, [selectedProvider, data]);

    // Fonction pour mettre à jour les filtres globaux (Inertia)
const handleFilterChange = (newParams) => {
    // On utilise le nom de la route 'analyste.providers' défini dans ton web.php
    router.get(route('analyste.providers'), { 
        start_date: newParams.startDate || startDate,
        end_date: newParams.endDate || endDate,
        granularity: newParams.granularity || granularity
    }, { 
        preserveState: true, // Garde l'état actuel de la page (ex: scroll, zoom)
        replace: true        // Remplace l'entrée dans l'historique pour éviter les retours arrière infinis
    });
};

    const exportImage = async (ref, fileName) => {
        if (!ref.current) return;
        const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: "#ffffff" });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${fileName}.png`;
        link.click();
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 shadow-xl border border-gray-100 rounded-lg">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
                    <p className="text-lg font-black text-slate-800">{formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Analyse des Revenus" />

            <div className="py-8 px-6 max-w-7xl mx-auto space-y-6">
                
                {/* Header Global */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase italic">Statistiques des Revenus</h2>
                        <p className="text-sm text-slate-500 font-medium">Analyse comparative par fournisseur</p>
                    </div>
                    
                    <button 
                        onClick={() => exportImage(chartRef, 'Revenus_Globaux')} 
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-600 transition-all shadow-lg whitespace-nowrap"
                    >
                        📥 EXPORTER LE GRAPHIQUE
                    </button>
                </div>

                {/* BARRE DE FILTRE GLOBALE (NOUVEAU) */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Période d'analyse</span>
                        <div className="flex items-center gap-2">
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => handleFilterChange({ startDate: e.target.value })}
                                className="rounded-xl border-gray-100 text-xs font-bold text-slate-700 focus:ring-orange-500"
                            />
                            <span className="text-slate-300">→</span>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => handleFilterChange({ endDate: e.target.value })}
                                className="rounded-xl border-gray-100 text-xs font-bold text-slate-700 focus:ring-orange-500"
                            />
                        </div>
                    </div>

                    <div className="h-8 w-[1px] bg-gray-100 hidden md:block"></div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Granularité</span>
                        <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                            <button 
                                onClick={() => handleFilterChange({ granularity: 'jour' })}
                                className={`px-6 py-1.5 rounded-lg text-[10px] font-black transition-all ${granularity === 'jour' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                JOUR
                            </button>
                            <button 
                                onClick={() => handleFilterChange({ granularity: 'mois' })}
                                className={`px-6 py-1.5 rounded-lg text-[10px] font-black transition-all ${granularity === 'mois' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                MOIS
                            </button>
                        </div>
                    </div>
                </div>

                {/* GRAPHIQUE GLOBAL */}
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-6 tracking-widest">Répartition par Fournisseur</h3>
                    <div ref={chartRef} className="h-[400px] w-full bg-white">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 10, right: 30, left: 40, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="nom_fournisseur" angle={-45} textAnchor="end" interval={0} tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} />
                                <YAxis tick={{fill: '#94a3b8', fontSize: 11}} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={45}>
                                    {data.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SECTION DÉTAILS SERVICES */}
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all duration-500">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 uppercase italic">
                                Détails Services : <span className="text-orange-500">{selectedProvider || "Sélectionner"}</span>
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">Chiffre d'affaires par service associé</p>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <select 
                                value={selectedProvider || ""}
                                onChange={(e) => setSelectedProvider(e.target.value)}
                                className="rounded-xl border-gray-200 text-sm font-bold text-slate-700 focus:ring-orange-500 focus:border-orange-500 w-full md:w-64"
                            >
                                {data.map((p, i) => (
                                    <option key={i} value={p.nom_fournisseur}>{p.nom_fournisseur}</option>
                                ))}
                            </select>

                            <button 
                                onClick={() => exportImage(detailRef, `Services_${selectedProvider}`)}
                                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-bold hover:bg-orange-600 transition-all whitespace-nowrap"
                            >
                                📥 EXPORTER CE DÉTAIL
                            </button>
                        </div>
                    </div>
                    
                    <div ref={detailRef} className="h-[400px] w-full bg-white">
                        {serviceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={serviceData} 
                                    margin={{ top: 10, right: 30, left: 40, bottom: 80 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="nom_service" 
                                        angle={-45} 
                                        textAnchor="end" 
                                        interval={0} 
                                        tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} 
                                    />
                                    <YAxis 
                                        tick={{fill: '#94a3b8', fontSize: 11}} 
                                        axisLine={false} 
                                        tickLine={false} 
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                                    <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={45}>
                                        {serviceData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                                Aucun service trouvé pour ce fournisseur.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}