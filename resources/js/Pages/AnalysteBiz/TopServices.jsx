import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function TopServices({ auth, topServices, startDate, endDate }) {
    
    // Fonction pour générer une couleur unique par service
    const getServiceColor = (index, total) => {
        const hue = (index * 360) / total;
        return `hsl(${hue}, 70%, 60%)`;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Top 20 Services - TT" />
            
            <div className="py-6 bg-[#F9F9FF] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
                    
                    {/* Header RÉDUIT et en BLEU #6A67FC (Style MSISDN) */}
                    <div className="bg-gradient-to-r from-[#6A67FC] to-[#807DFF] rounded-2xl p-5 text-white shadow-md border-b-4 border-[#534FDB]">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2 text-white">
                                    <span className="p-1.5 bg-white/10 rounded-lg text-lg">📊</span>
                                    Top 20 Services
                                </h1>
                                <p className="text-white/80 text-[10px] font-medium uppercase tracking-[0.2em] mt-0.5 ml-9">
                                    Analyse du Chiffre d'Affaires (VAS SMS+)
                                </p>
                            </div>
                            <div className="text-right hidden md:block bg-black/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                                <p className="text-[9px] uppercase font-black text-white/60 tracking-tighter">Période d'analyse</p>
                                <p className="text-xs font-bold italic">{startDate} au {endDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Zone Graphique */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EBEBFF]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">Performance Comparative</h3>
                            <span className="bg-[#F9F9FF] text-[#6A67FC] text-[10px] font-bold px-3 py-1 rounded-full border border-[#EBEBFF]">
                                UNITÉ: DINARS TUNISIENS (TND)
                            </span>
                        </div>

                        <div className="h-[500px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={topServices} 
                                    margin={{ top: 10, right: 10, left: 20, bottom: 90 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis 
                                        dataKey="service_name" 
                                        angle={-45} 
                                        textAnchor="end" 
                                        interval={0}
                                        height={100}
                                        tick={{fontSize: 9, fontWeight: 'bold', fill: '#64748B'}} 
                                    />
                                    <YAxis 
                                        tick={{fontSize: 11, fill: '#94A3B8'}} 
                                        tickFormatter={(value) => `${value.toLocaleString()}`}
                                    />
                                    <Tooltip 
                                        cursor={{fill: '#F9F9FF'}}
                                        contentStyle={{ 
                                            borderRadius: '12px', 
                                            border: 'none', 
                                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                            fontSize: '12px'
                                        }}
                                        formatter={(value, name, props) => [
                                            `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 3 }).format(value)} TND`, 
                                            `Revenu (${props.payload.nom_fournisseur})` 
                                        ]}
                                    />
                                    <Bar dataKey="total_revenue" radius={[4, 4, 0, 0]} barSize={30}>
                                        {topServices.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={getServiceColor(index, topServices.length)} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Info footer */}
                    <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em] pt-2">
                        Direction Centrale Business — Tunisie Télécom
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}