import React, { useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import html2canvas from 'html2canvas';

export default function RevenueByService({ auth, data, startDate, endDate }) {
    const chartRef = useRef(null);

    const formatCurrency = (val) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(val);

    const exportImage = async () => {
        const canvas = await html2canvas(chartRef.current, { scale: 2, backgroundColor: "#ffffff" });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `Revenus_Services_${startDate}.png`;
        link.click();
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Revenus par Service" />
            <div className="py-8 px-6 max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase italic">Analyse par Service (Top 20)</h2>
                        <p className="text-sm text-slate-500 font-medium">Période : {startDate} au {endDate}</p>
                    </div>
                    <button onClick={exportImage} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-700 transition-all">
                        📥 Export Image
                    </button>
                </div>

                <div ref={chartRef} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <div className="h-[700px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} layout="vertical" margin={{ left: 50, right: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="nom_service" 
                                    type="category" 
                                    width={150} 
                                    tick={{fill: '#475569', fontSize: 10, fontWeight: 800}}
                                />
                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                <Bar dataKey="total" fill="#f59e0b" radius={[0, 5, 5, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}