import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function MsisdnSearch({ auth, results, filters }) {
    const [msisdn, setMsisdn] = useState(filters?.msisdn || '');
    const [activeTab, setActiveTab] = useState('single');
    const [file, setFile] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!msisdn.trim()) return;

        router.get(
            route('analyste.api.search'), 
            { msisdn: msisdn.trim() }, 
            { 
                preserveState: true, 
                replace: true,
                only: ['results', 'filters'],
            }
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Investigation MSISDN - TT" />
            
            <div className="py-8 bg-[#f4f7fe] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#1a4099] to-[#6c2da3] rounded-[2rem] p-8 text-white shadow-lg border-b-4 border-[#122e6e]">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-black italic tracking-tighter uppercase">Investigation MSISDN</h1>
                                <p className="text-blue-100 text-xs mt-1 font-bold uppercase tracking-widest"> — Tunisie Télécom</p>
                            </div>
                            <div className="flex bg-white/10 p-1 rounded-xl backdrop-blur-md">
                                <button onClick={() => setActiveTab('single')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'single' ? 'bg-white text-[#1a4099] shadow' : 'text-white hover:bg-white/10'}`}>UNITAIRE</button>
                                <button onClick={() => setActiveTab('bulk')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'bulk' ? 'bg-white text-[#1a4099] shadow' : 'text-white hover:bg-white/10'}`}>PAR LISTE (EXCEL)</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                        {activeTab === 'single' ? (
                            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-2 tracking-widest">Saisir le numéro (B_MSISDN)</label>
                                    <input type="text" value={msisdn} onChange={(e) => setMsisdn(e.target.value)} placeholder="Ex: 21696..." className="w-full h-14 rounded-2xl border-gray-100 bg-gray-50 focus:ring-2 focus:ring-[#1a4099] font-bold" />
                                </div>
                                <button type="submit" className="h-14 bg-[#1a4099] text-white px-10 rounded-2xl font-black uppercase text-sm shadow-lg shadow-blue-100">Rechercher</button>
                            </form>
                        ) : (
                            <form action={route('analyste.bulk.search')} method="POST" encType="multipart/form-data" className="space-y-4">
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                <div className="border-2 border-dashed rounded-[2rem] p-8 text-center transition-colors bg-gray-50/50 border-gray-200 hover:border-[#1a4099]">
                                    <input type="file" name="excel_file" id="fileUpload" className="hidden" onChange={(e) => setFile(e.target.files[0])} accept=".xlsx, .xls, .csv" required />
                                    <label htmlFor="fileUpload" className="cursor-pointer block">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p className="text-sm font-bold text-gray-600">{file ? `Fichier prêt : ${file.name}` : "Cliquez pour importer votre liste de MSISDN (.xlsx)"}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase">Format attendu : Colonne A uniquement</p>
                                    </label>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button type="submit" className="h-12 bg-[#6c2da3] text-white px-8 rounded-xl font-black uppercase text-xs shadow-lg shadow-purple-100 hover:scale-105 transition-all">Lancer l'analyse Batch</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Résultats Unitaire */}
                    {activeTab === 'single' && results && (
                        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-400">MSISDN</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-400">Date</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-400">Heure</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-400">Keyword</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-400 text-right">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length > 0 ? (
                                        results.map((res, index) => (
                                            <tr key={index} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                                                <td className="p-4 font-bold text-[#1a4099]">{res.msisdn}</td>
                                                <td className="p-4 text-gray-600">{res.date}</td>
                                                <td className="p-4 text-gray-500">{res.hour}h</td>
                                                <td className="p-4"><span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase">{res.keyword}</span></td>
                                                <td className="p-4 text-right font-black text-gray-900">{res.amount} TND</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="p-10 text-center text-gray-400 font-bold uppercase text-xs">Aucun résultat trouvé</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}