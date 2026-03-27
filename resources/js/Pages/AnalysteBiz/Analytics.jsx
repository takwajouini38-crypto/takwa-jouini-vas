import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, 
    Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import html2canvas from 'html2canvas';
import { useRef } from 'react';

export default function Analytics({ auth, revenueByProvider, revenueByDay, revenueByService, startDate, endDate }) {
    
    // Références individuelles pour chaque section de graphique
    const providerRef = useRef(null);
    const serviceRef = useRef(null);
    const dailyRef = useRef(null);

    // Formatage professionnel des montants (TND)
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'TND',
            minimumFractionDigits: 3 
        }).format(value);
    };

    // Fonction générique d'exportation pour une référence spécifique
    const exportCardAsImage = async (ref, fileName) => {
        const element = ref.current;
        const canvas = await html2canvas(element, { 
            scale: 3, 
            useCORS: true,
            backgroundColor: "#ffffff" // Assure un fond blanc propre pour PowerPoint
        });
        const data = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = data;
        link.download = `${fileName}_${startDate}.png`;
        link.click();
    };

    const exportExcel = () => {
        window.location.href = route('analyste.export', { start_date: startDate, end_date: endDate });
    };

    return (
        <AuthenticatedLayout 
            user={auth.user} 
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight uppercase tracking-wider italic">Dashboard Decisionnel VAS</h2>
                    <button onClick={exportExcel} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-emerald-700 shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all uppercase">
                        📊 Rapport Excel Global
                    </button>
                </div>
            }
        >
            <Head title="Analyses des Revenus - TT" />

            <div className="py-8 px-6 max-w-7xl mx-auto space-y-8">
                
                {/* --- HEADER STATISTIQUES --- */}
                <div className="p-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center bg-gradient-to-r from-white to-slate-50">
                    <div>
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Période d'analyse active</p>
                        <p className="text-slate-700 text-lg font-bold">Du {startDate} au {endDate}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Chiffre d'Affaires Global</p>
                        <p className="text-3xl font-black text-[#1a4099]">
                            {formatCurrency(revenueByProvider.reduce((acc, curr) => acc + parseFloat(curr.total), 0))}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* 1. REVENUS PAR FOURNISSEUR */}
                    <div ref={providerRef} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative group">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-slate-700 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                Revenus par Fournisseur
                            </h3>
                            {/* BOUTON EXPORT IMAGE - Apparaît au survol (group-hover) */}
                            <button 
                                onClick={() => exportCardAsImage(providerRef, 'TT_Revenu_Fournisseur')}
                                className="opacity-0 group-hover:opacity-100 p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-[#1a4099] rounded-xl transition-all shadow-sm border border-slate-100"
                                title="Télécharger le graphique"
                            >
                                📥
                            </button>
                        </div>
                        <div style={{ width: '100%', height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueByProvider} margin={{ bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="nom_fournisseur" 
                                        tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} 
                                        interval={0} angle={-45} textAnchor="end" height={80}
                                    />
                                    <YAxis tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                                    <Tooltip formatter={(val) => formatCurrency(val)} />
                                    <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. REVENUS PAR SERVICE */}
                    <div ref={serviceRef} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative group">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-slate-700 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                                Revenus par Service
                            </h3>
                            <button 
                                onClick={() => exportCardAsImage(serviceRef, 'TT_Revenu_Service')}
                                className="opacity-0 group-hover:opacity-100 p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-[#1a4099] rounded-xl transition-all shadow-sm border border-slate-100"
                            >
                                📥
                            </button>
                        </div>
                        <div style={{ width: '100%', height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueByService} margin={{ bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="nom_service" 
                                        tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}} 
                                        interval={0} angle={-45} textAnchor="end" height={80}
                                    />
                                    <YAxis tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                                    <Tooltip formatter={(val) => formatCurrency(val)} />
                                    <Bar dataKey="total" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. ÉVOLUTION DU REVENU PAR JOUR */}
                    <div ref={dailyRef} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 lg:col-span-2 relative group">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-slate-700 font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-[#1a4099] rounded-full"></div>
                                Évolution du Chiffre d'Affaires
                            </h3>
                            <button 
                                onClick={() => exportCardAsImage(dailyRef, 'TT_Evolution_Quotidienne')}
                                className="opacity-0 group-hover:opacity-100 p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-[#1a4099] rounded-xl transition-all shadow-sm border border-slate-100"
                            >
                                📥
                            </button>
                        </div>
                        <div style={{ width: '100%', height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueByDay}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1a4099" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#1a4099" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" tick={{fontSize: 10, fontWeight: 700}} />
                                    <YAxis tick={{fontSize: 10, fontWeight: 700}} />
                                    <Tooltip formatter={(val) => formatCurrency(val)} />
                                    <Area type="monotone" dataKey="total" stroke="#1a4099" fillOpacity={1} fill="url(#colorRev)" strokeWidth={4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
                
                <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] py-4">
                    Direction Centrale Business — Tunisie Télécom
                </p>
            </div>
        </AuthenticatedLayout>
    );
}