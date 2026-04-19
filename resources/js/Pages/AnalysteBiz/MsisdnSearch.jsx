import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { 
    CheckCircleIcon, 
    ExclamationCircleIcon,
    CloudArrowUpIcon,
    RocketLaunchIcon,
    MagnifyingGlassIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';

export default function MsisdnSearch({ auth, results, filters }) {
    const [msisdn, setMsisdn] = useState(filters?.msisdn || '');
    const [activeTab, setActiveTab] = useState('single');
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    // Validation du MSISDN (Tunisie 216 + 8 chiffres)
    useEffect(() => {
        if (touched) {
            if (!msisdn) {
                setLocalError("Le MSISDN est requis.");
            } else if (!msisdn.startsWith('216')) {
                setLocalError("Le MSISDN doit commencer par 216.");
            } else if (!/^\d{11}$/.test(msisdn)) {
                setLocalError("Le MSISDN doit contenir exactement 11 chiffres.");
            } else {
                setLocalError("");
            }
        }
    }, [msisdn, touched]);

    const handleMsisdnChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setMsisdn(value);
        }
        setTouched(true);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setTouched(true);

        if (!msisdn || !msisdn.startsWith('216') || !/^\d{11}$/.test(msisdn)) {
            return;
        }

        setIsLoading(true);
        router.get(
            route('analyste.api.search'), 
            { msisdn: msisdn.trim() }, 
            { 
                preserveState: true, 
                replace: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const isValid = msisdn && msisdn.startsWith('216') && /^\d{11}$/.test(msisdn);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Investigation MSISDN - TT" />
            
            <div className="relative py-6 min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/recherche.png')" }}>
                <div className="absolute inset-0 bg-black/40"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* HEADER SECTION */}
                    <div className="bg-gradient-to-r from-[#6A67FC] to-[#807DFF] rounded-2xl p-5 text-white shadow-lg border-b-4 border-[#534FDB]">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <MagnifyingGlassIcon className="w-6 h-6" /> Investigation MSISDN
                                </h1>
                                <p className="text-white/80 text-[10px] uppercase mt-1 tracking-widest">
                                    Tunisie Télécom — Revenue Assurance
                                </p>
                            </div>

                            <div className="flex bg-black/15 p-1 rounded-xl border border-white/10">
                                <button onClick={() => setActiveTab('single')} 
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'single' ? 'bg-white text-[#6A67FC] shadow-sm' : 'text-white hover:bg-white/10'}`}>
                                    RECHERCHE UNITAIRE
                                </button>
                                <button onClick={() => setActiveTab('bulk')} 
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'bulk' ? 'bg-white text-[#6A67FC] shadow-sm' : 'text-white hover:bg-white/10'}`}>
                                    BATCH EXCEL
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* FORM SECTION */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-[#EBEBFF]">
                        {activeTab === 'single' ? (
                            <form onSubmit={handleSearch} className="flex flex-col gap-4">
                                <div className="relative">
                                    <label className="text-xs font-bold text-slate-500 mb-1 block uppercase ml-1">Numéro de téléphone</label>
                                    <input 
                                        type="text"
                                        value={msisdn}
                                        onChange={handleMsisdnChange}
                                        onBlur={() => setTouched(true)}
                                        placeholder="216XXXXXXXX"
                                        className={`w-full h-12 pl-4 rounded-xl transition-all outline-none border ${localError ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-[#6A67FC] focus:ring-4 focus:ring-[#6A67FC]/10'}`}
                                    />
                                    {localError && <p className="text-red-500 text-xs mt-1 font-medium italic">{localError}</p>}
                                </div>

                                <button 
                                    type="submit"
                                    disabled={!isValid || isLoading}
                                    className={`h-12 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2
                                        ${!isValid || isLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#6A67FC] text-white hover:bg-[#534FDB] active:scale-[0.98]'}`}
                                >
                                    {isLoading ? "Traitement..." : "Lancer l'analyse"}
                                </button>
                            </form>
                        ) : (
                            <form action={route('analyste.bulk.search')} method="POST" encType="multipart/form-data" className="flex flex-col gap-6">
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                <div className="flex flex-col items-center justify-center w-full">
                                    <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all 
                                        ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#6A67FC]'}`}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {file ? (
                                                <>
                                                    <CheckCircleIcon className="w-10 h-10 text-green-600 mb-2" />
                                                    <p className="text-sm font-bold text-green-700">{file.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <CloudArrowUpIcon className="w-10 h-10 mb-3 text-slate-400" />
                                                    <p className="text-sm text-slate-500">Cliquez pour choisir un fichier <span className="font-bold text-[#6A67FC]">Excel / CSV</span></p>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" name="excel_file" className="hidden" accept=".xlsx, .xls, .csv" onChange={(e) => setFile(e.target.files[0])} required />
                                    </label>
                                </div>
                                <button type="submit" disabled={!file} className={`w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3 ${!file ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#6A67FC] to-[#534FDB] text-white'}`}>
                                    <RocketLaunchIcon className="w-5 h-5" /> Lancer le traitement batch
                                </button>
                            </form>
                        )}
                    </div>

                    {/* RESULTS TABLE SECTION */}
                    {activeTab === 'single' && results && (
                        <div className="bg-white rounded-2xl shadow-2xl border border-[#EBEBFF] overflow-hidden">
                            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                                <TableCellsIcon className="w-5 h-5 text-[#6A67FC]" />
                                <h3 className="text-xs font-black uppercase text-slate-600 tracking-tighter">Résultats détaillés pour : {filters?.msisdn}</h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#F8F9FF] text-[#6A67FC] text-[11px] font-black uppercase tracking-wider">
                                            <th className="px-6 py-4 border-b">Fournisseur</th>
                                            <th className="px-6 py-4 border-b">Service</th>
                                            <th className="px-6 py-4 border-b text-center">Nb Taxation</th>
                                            <th className="px-6 py-4 border-b text-right">Montant Taxé (TND)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {results.length > 0 ? (
                                            results.map((res, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-bold text-slate-700">{res.provider_name || 'Inconnu'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-slate-600">{res.service_name || 'N/A'}</span>
                                                            <span className="text-[10px] text-slate-400 font-mono">Shortcode: {res.b_msisdn}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                            {res.nb_taxation}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-black text-[#534FDB]">
                                                            {new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3 }).format(res.tnd_amount)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">
                                                    Aucun enregistrement trouvé pour ce MSISDN.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {results.length > 0 && (
                                        <tfoot className="bg-slate-50">
                                            <tr className="font-black text-slate-700">
                                                <td colSpan="2" className="px-6 py-4 text-right text-xs uppercase">Total Général</td>
                                                <td className="px-6 py-4 text-center text-blue-900">
                                                    {results.reduce((acc, curr) => acc + parseInt(curr.nb_taxation), 0)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-[#534FDB]">
                                                    {new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3 }).format(
                                                        results.reduce((acc, curr) => acc + parseFloat(curr.tnd_amount), 0)
                                                    )} TND
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}