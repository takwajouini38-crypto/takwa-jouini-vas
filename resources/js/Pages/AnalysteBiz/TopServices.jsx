import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

// Palette de couleurs variées pour distinguer chaque service
const COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', 
    '#10b981', '#06b6d4', '#3b82f6', '#2dd4bf', '#fbbf24',
    '#a855f7', '#f97316', '#ef4444', '#14b8a6', '#0ea5e9',
    '#64748b', '#475569', '#d946ef', '#059669', '#db2777'
];

export default function TopServices({ auth, topServices, hasData, filters }) {
    
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return dateString;
    };

    const [startDate, setStartDate] = useState(formatDateForInput(filters.start_date));
    const [endDate, setEndDate] = useState(formatDateForInput(filters.end_date));

    useEffect(() => {
        setStartDate(formatDateForInput(filters.start_date));
        setEndDate(formatDateForInput(filters.end_date));
    }, [filters]);

    const formatRevenue = (value) => 
        new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(value);

    // --- EXPORTS ---
    const downloadChart = (chartId, fileName) => {
        const element = document.getElementById(chartId);
        html2canvas(element, { backgroundColor: '#ffffff', scale: 2 }).then((canvas) => {
            const link = document.createElement('a');
            link.download = `${fileName}_${startDate}_${endDate}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    };

    const handleExcelExport = () => {
        if (!topServices || topServices.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(topServices);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Top_Services");
        XLSX.writeFile(workbook, `Top_Services_SMSplus_${startDate}_au_${endDate}.xlsx`);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Top Services SMS+" />
            
            <div className="p-6 bg-[#f8fafc] min-h-screen space-y-6">
                
                {/* Header & Filtres */}
                <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-wrap items-center justify-between border border-slate-100">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-800">Top 20 Services SMS+</h1>
                        <p className="text-sm text-slate-500">Analyse de la performance par revenu </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-50 rounded-xl px-3 border border-slate-200">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none text-sm focus:ring-0 py-2" />
                            <span className="text-slate-400 px-2">au</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none text-sm focus:ring-0 py-2" />
                        </div>
                        <button 
                            onClick={() => router.get('/monitoring/top-services', { start_date: startDate, end_date: endDate }, { preserveState: true })} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors"
                        >
                            Filtrer
                        </button>
                        <button onClick={handleExcelExport} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">Excel</button>
                    </div>
                </div>

                {hasData ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Liste Détaillée */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[600px]">
                            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6">Classement Revenu</h3>
                            <div className="overflow-y-auto custom-scrollbar pr-2">
                                {topServices.map((service, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 mb-3 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <span 
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            >
                                                {index + 1}
                                            </span>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 truncate w-32 md:w-40">{service.service_name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{service.nom_fournisseur}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-slate-700">{formatRevenue(service.total_revenue)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Graphique de Performance */}
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col" id="chart-top">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Visualisation des Parts de Revenu</h3>
                                <button onClick={() => downloadChart('chart-top', 'Top_Services')} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1 px-3 rounded-lg">Capture PNG</button>
                            </div>
                            <div className="flex-1 min-h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topServices} layout="vertical" margin={{ left: 40, right: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="service_name" type="category" tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} width={100} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value) => [formatRevenue(value), "Revenu"]}
                                        />
                                        <Bar dataKey="total_revenue" radius={[0, 10, 10, 0]} barSize={20}>
                                            {topServices.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={COLORS[index % COLORS.length]} 
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[2.5rem] shadow-sm text-center border border-dashed border-slate-300">
                        <div className="mb-4 text-slate-300">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-500 text-lg font-medium">Aucune donnée trouvée pour cette période.</p>
                        <p className="text-slate-400 text-sm">Choisissez une autre période pour afficher les données.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}