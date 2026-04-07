import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine 
} from 'recharts';
import * as XLSX from 'xlsx';
import { toPng } from 'html-to-image';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'; 

export default function TrafficDashboard({ auth, data, filters, stats }) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    useEffect(() => {
        setStartDate(filters.start_date);
        setEndDate(filters.end_date);
    }, [filters]);

    // CALCUL DES MOYENNES (SÉCURISÉ POUR RECHARTS)
    const avgMMG = data?.length > 0 
        ? data.reduce((acc, curr) => acc + Number(curr.mmg_count || 0), 0) / data.length 
        : 0;
    const avgOCC = data?.length > 0 
        ? data.reduce((acc, curr) => acc + Number(curr.occ_count || 0), 0) / data.length 
        : 0;

    const formatYAxis = (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value);

    const renderGauge = (value, color, label, maxVal = 25000) => {
        const displayValue = Math.min(value, maxVal);
        const gaugeData = [{ value: displayValue }, { value: maxVal - displayValue }];

        return (
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center h-56 relative">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={gaugeData} cx="50%" cy="85%" startAngle={180} endAngle={0} innerRadius={55} outerRadius={75} dataKey="value" stroke="none">
                            <Cell fill={color} />
                            <Cell fill="#f1f5f9" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute bottom-6 text-center">
                    <p className="text-2xl font-black" style={{ color: color }}>{value.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Volume Total</p>
                </div>
            </div>
        );
    };

    const handleFilter = () => {
        router.get('/analyste-op/traffic', { start_date: startDate, end_date: endDate }, { preserveState: true });
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trafic_SMS_Plus");
        XLSX.writeFile(workbook, `Rapport_Trafic_${startDate}_au_${endDate}.xlsx`);
    };

    const exportChart = (elementId, fileName) => {
        const node = document.getElementById(elementId);
        toPng(node, { backgroundColor: '#ffffff', cacheBust: true })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${fileName}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => console.error('Erreur export image:', err));
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
                        <button onClick={handleFilter} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700">Filtrer</button>
                        <button onClick={exportToExcel} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700">Excel</button>
                    </div>
                </div>

                {/* Section KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderGauge(stats.total_mmg, "#6366f1", "Volume Global MMG")}
                    {renderGauge(stats.total_occ, "#10b981", "Volume Global OCC")}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Écart Moyen de Fiabilité</p>
                        <p className="text-4xl font-black text-amber-500">{stats.avg_deviation}%</p>
                    </div>
                </div>

                {/* Graphique de Comparaison Principal */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100" id="main-chart">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-8 tracking-widest">Comparaison MMG vs OCC par Date</h3>
                    <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ left: 20, bottom: 40, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{fontSize: 10}} label={{ value: 'Date de création', position: 'insideBottom', offset: -25, fontSize: 12, fill: '#64748b' }} />
                                <YAxis tickFormatter={formatYAxis} tick={{fontSize: 11}} label={{ value: 'Nombre de CDR', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#64748b' }} />
                                <Tooltip cursor={{fill: '#f8fafc'}} />
                                <Legend iconType="circle" wrapperStyle={{paddingTop: '40px'}} />
                                <Bar dataKey="mmg_count" name="Volume MMG" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
                                <Bar dataKey="occ_count" name="Volume OCC" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                                
                                {/* Lignes de tendance sur le graphique principal */}
                                <ReferenceLine y={avgMMG} stroke="#6366f1" strokeDasharray="5 5" label={{ value: `Moy: ${avgMMG.toFixed(0)}`, position: 'right', fill: '#6366f1', fontSize: 10 }} />
                                <ReferenceLine y={avgOCC} stroke="#10b981" strokeDasharray="5 5" label={{ value: `Moy: ${avgOCC.toFixed(0)}`, position: 'left', fill: '#10b981', fontSize: 10 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tendances Journalières */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100" id="mmg-trend">
                        <h4 className="text-[10px] font-bold uppercase text-indigo-500 mb-6 tracking-widest">Tendance Volume MMG</h4>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ bottom: 40 }}>
                                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{fontSize: 9}} />
                                    <YAxis tickFormatter={formatYAxis} tick={{fontSize: 10}} />
                                    <Tooltip />
                                    <ReferenceLine y={avgMMG} stroke="#6366f1" strokeDasharray="3 3" />
                                    <Bar dataKey="mmg_count" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100" id="occ-trend">
                        <h4 className="text-[10px] font-bold uppercase text-emerald-500 mb-6 tracking-widest">Tendance Volume OCC</h4>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ bottom: 40 }}>
                                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} tick={{fontSize: 9}} />
                                    <YAxis tickFormatter={formatYAxis} tick={{fontSize: 10}} />
                                    <Tooltip />
                                    <ReferenceLine y={avgOCC} stroke="#10b981" strokeDasharray="3 3" />
                                    <Bar dataKey="occ_count" fill="#34d399" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* RÉINTRODUCTION DU TABLEAU D'ÉCART JOURNALIER */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black uppercase text-slate-400 mb-8 tracking-widest">Détail des Écarts Journaliers (%)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
                        {data.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center transition-transform hover:scale-105">
                                <p className="text-[9px] text-slate-400 font-bold mb-1">{item.date}</p>
                                <p className={`text-sm font-black ${item.deviation > 5 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {item.deviation}%
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}