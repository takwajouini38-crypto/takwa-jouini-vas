import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function TopServices({ auth, topServices, startDate, endDate }) {
    
    // Couleurs institutionnelles TT
    const COLORS = ['#1a4099', '#6c2da3']; 

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Top 20 Services - TT" />
            
            <div className="py-8 bg-[#f0f4f8] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header stylisé */}
                    <div className="bg-gradient-to-r from-[#1a4099] to-[#6c2da3] rounded-[2rem] p-8 text-white shadow-xl flex justify-between items-center border-b-8 border-[#122e6e]">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight italic">Top 20 Services</h1>
                            <p className="text-blue-100/80 mt-1 uppercase text-xs font-bold tracking-widest">
                                Analyse du Chiffre d'Affaires par Service (VAS SMS+)
                            </p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] uppercase font-mono text-blue-200">Période d'analyse</p>
                            <p className="text-sm font-bold italic">{startDate} au {endDate}</p>
                        </div>
                    </div>

                    {/* Zone Graphique */}
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Performance Comparative</h3>
                            <span className="bg-blue-50 text-[#1a4099] text-[10px] font-bold px-3 py-1 rounded-full border border-blue-100">
                                UNITÉ: DINARS TUNISIENS (TND)
                            </span>
                        </div>

                        <div className="h-[500px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topServices} margin={{ top: 20, right: 30, left: 40, bottom: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="nom_service" 
                                        angle={-45} 
                                        textAnchor="end" 
                                        interval={0}
                                        tick={{fontSize: 11, fontWeight: 'bold', fill: '#64748b'}} 
                                    />
                                    <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} />
                                    <Tooltip 
                                        cursor={{fill: '#f8fafc'}}
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        formatter={(value) => [`${new Intl.NumberFormat('fr-FR').format(value)} TND`, 'Revenu']}
                                    />
                                    <Bar dataKey="total_revenue" radius={[6, 6, 0, 0]} barSize={40}>
                                        {topServices.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#1a4099' : '#6c2da3'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Info footer */}
                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                        Direction Centrale Business — Tunisie Télécom
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}