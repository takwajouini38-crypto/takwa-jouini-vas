import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CommandLineIcon, 
    ArrowPathIcon, 
    ExclamationTriangleIcon,
    ChartBarIcon,
    ServerIcon
} from '@heroicons/react/24/outline';

export default function OpMainView({ auth, stats }) {
    
    // Configuration des indicateurs (KPIs) 
    const kpis = [
        { 
            title: "Total Jobs", 
            subtitle: "Processus globaux",
            value: stats?.total || 0, 
            iconColor: "bg-blue-500", 
            icon: <CommandLineIcon className="w-6 h-6 text-white" /> 
        },
        { 
            title: "Services SMS+", 
            subtitle: "Services actifs en base",
            value: stats?.services_count || 0, 
            iconColor: "bg-purple-500", 
            icon: <ServerIcon className="w-6 h-6 text-white" /> 
        },
        { 
            title: "En cours", 
            subtitle: "Traitement actif",
            value: stats?.running || 0, 
            iconColor: "bg-green-500", 
            icon: <ArrowPathIcon className="w-6 h-6 text-white animate-spin-slow" /> 
        },
        { 
            title: "Échecs", 
            subtitle: "Erreurs système",
            value: stats?.failed || 0, 
            iconColor: "bg-red-500", 
            icon: <ExclamationTriangleIcon className="w-6 h-6 text-white" /> 
        },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Analyste" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* BANDEAU DE TITRE DÉGRADÉ */}
                    <div className="mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-lg shadow-indigo-100 text-white relative overflow-hidden">
                        {/* Décoration d'arrière-plan */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10">
                            <h1 className="text-3xl font-extrabold tracking-tight">Analyste Opérationnelle</h1>
                            <p className="mt-2 text-indigo-100 font-medium">Monitoring technique et inventaire des services SMS+</p>
                        </div>
                    </div>

                    {/* TITRE DE LA SECTION INDICATEURS */}
                    <div className="mb-8 flex items-center gap-2">
                        <ChartBarIcon className="w-5 h-5 text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                           Indicateurs Système & Business
                        </h2>
                    </div>

                    {/* GRILLE DES CARTES KPIs (Style Harmonisé Admin) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {kpis.map((kpi, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center transition-all hover:shadow-md hover:-translate-y-1"
                            >
                                {/* Icône colorée à gauche (Style Admin) */}
                                <div className={`${kpi.iconColor} p-4 rounded-xl mr-5 flex items-center justify-center shadow-lg shadow-gray-100`}>
                                    {kpi.icon}
                                </div>

                                {/* Textes des KPIs */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.title}</h3>
                                    <p className="text-3xl font-black text-gray-800 leading-tight">
                                        {kpi.value}
                                    </p>
                                    <p className="text-[10px] text-indigo-500 font-semibold italic leading-none mt-1">{kpi.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
            
            {/* Styles pour l'animation de rotation de l'icône "En cours" */}
            <style jsx>{`
                .animate-spin-slow {
                    animation: spin 4s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}