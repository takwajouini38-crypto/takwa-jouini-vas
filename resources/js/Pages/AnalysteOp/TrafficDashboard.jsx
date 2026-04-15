import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export default function TrafficDashboard({ auth, data, filters, stats }) {
    
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        let cleanedDate = dateString.startsWith('00') ? '20' + dateString.substring(2) : dateString;
        const date = new Date(cleanedDate);
        return isNaN(date.getTime()) ? cleanedDate : date.toISOString().split('T')[0];
    };

    const [startDate, setStartDate] = useState(formatDateForInput(filters.start_date));
    const [endDate, setEndDate] = useState(formatDateForInput(filters.end_date));

    useEffect(() => {
        setStartDate(formatDateForInput(filters.start_date));
        setEndDate(formatDateForInput(filters.end_date));
    }, [filters]);

    const formatYAxis = (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value);

    // --- FONCTION EXPORT PNG ---
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
        if (!data || data.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trafic");
        XLSX.writeFile(workbook, `Trafic_${startDate}_au_${endDate}.xlsx`);
    };

    const renderGauge = (value, color, label) => {
        const maxVal = Math.max(value * 1.2, 25000);
        const gaugeData = [{ value: value }, { value: maxVal - value }];
        return (
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center h-56 relative">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">{label}</p>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={gaugeData} cx="50%" cy="85%" startAngle={180} endAngle={0} innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                            <Cell fill={color} /><Cell fill="#f1f5f9" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-6 text-center">
                    <p className="text-2xl font-black" style={{ color: color }}>{value.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400">Volume Total</p>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Suivi Trafic SMS+" />
            <div className="p-6 bg-[#f8fafc] min-h-screen space-y-6">
                
                {/* Header & Filtres */}
                <div className="bg-white p-6 rounded-3xl shadow-sm flex flex-wrap items-center justify-between border border-slate-100">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-800">Analyse Comparative des Flux</h1>
                        <p className="text-sm text-slate-500">Revenue Assurance - Monitoring SMS+</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-50 rounded-xl px-3 border border-slate-200">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none text-sm focus:ring-0 py-2" />
                            <span className="text-slate-400 px-2">au</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none text-sm focus:ring-0 py-2" />
                        </div>
                        <button onClick={() => router.get('/analyste-op/traffic', { start_date: startDate, end_date: endDate }, { preserveState: true })} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Filtrer</button>
                        <button onClick={handleExcelExport} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Excel</button>
                    </div>
                </div>

                {data && data.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {renderGauge(stats.total_mmg, "#6366f1", "Volume Global MMG")}
                            {renderGauge(stats.total_occ, "#10b981", "Volume Global OCC")}
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Écart Moyen</p>
                                <p className="text-4xl font-black text-amber-500">{stats.avg_deviation}%</p>
                            </div>
                        </div>

                        {/* Graphique de Comparaison Combiné */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 relative" id="chart-main">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Comparaison MMG vs OCC</h3>
                                <button onClick={() => downloadChart('chart-main', 'Comparaison_Globale')} className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1 px-3 rounded-lg transition-colors">Capture PNG</button>
                            </div>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data} margin={{ bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" tick={{fontSize: 10}} />
                                        <YAxis tickFormatter={formatYAxis} tick={{fontSize: 11}} />
                                        <Tooltip cursor={{fill: '#f8fafc'}} />
                                        <Legend verticalAlign="top" align="right" iconType="circle" />
                                        <Bar dataKey="mmg_count" name="MMG" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                        <Bar dataKey="occ_count" name="OCC" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Histogrammes Individuels */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* MMG Individuel */}
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100" id="chart-mmg">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Flux MMG</h3>
                                    <button onClick={() => downloadChart('chart-mmg', 'Flux_MMG')} className="text-[9px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-1 px-2 rounded-lg">PNG</button>
                                </div>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data} margin={{ bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" tick={{fontSize: 9}} angle={-45} textAnchor="end" height={50} />
                                            <YAxis tickFormatter={formatYAxis} tick={{fontSize: 10}} />
                                            <Tooltip />
                                            <Bar dataKey="mmg_count" name="CDR MMG" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* OCC Individuel */}
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100" id="chart-occ">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Flux OCC</h3>
                                    <button onClick={() => downloadChart('chart-occ', 'Flux_OCC')} className="text-[9px] bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold py-1 px-2 rounded-lg">PNG</button>
                                </div>
                                <div className="h-[280px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data} margin={{ bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" tick={{fontSize: 9}} angle={-45} textAnchor="end" height={50} />
                                            <YAxis tickFormatter={formatYAxis} tick={{fontSize: 10}} />
                                            <Tooltip />
                                            <Bar dataKey="occ_count" name="CDR OCC" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Détail des Écarts */}
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                            <h3 className="text-xs font-black uppercase text-slate-400 mb-8 tracking-widest">Détail des Écarts (%)</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
                                {data.map((item, idx) => (
                                    <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center transition-all hover:scale-105">
                                        <p className="text-[9px] text-slate-400 font-bold mb-1">{item.date}</p>
                                        <p className={`text-sm font-black ${item.deviation > 5 ? 'text-red-500' : 'text-emerald-500'}`}>{item.deviation}%</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white p-20 rounded-[2.5rem] shadow-sm text-center border border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg font-medium">Aucune donnée de traffic disponible.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}