import React from "react";
import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CommandLineIcon, 
    ArrowPathIcon, 
    ExclamationTriangleIcon,
    ChartBarIcon,
    ServerIcon,
    CheckCircleIcon,
    ClockIcon,
    CalendarIcon,
    ChevronRightIcon,
    ArrowTrendingUpIcon,
    CpuChipIcon,
    FireIcon,
    ShieldCheckIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

export default function OpMainView({ auth, stats, latestJobs = [], topServices = [], statusStats = {}, successRate = 0, lastJob = null }) {
    
    // Configuration des indicateurs (KPIs) 
    const kpis = [
        { 
            title: "Total Jobs", 
            subtitle: "Processus globaux",
            value: stats?.total || 0, 
            iconColor: "from-blue-500 to-blue-600", 
            icon: <CommandLineIcon className="w-6 h-6 text-white" />,
            bgGradient: "from-blue-50 to-blue-100",
            borderColor: "border-blue-200"
        },
        { 
            title: "Services SMS+", 
            subtitle: "Services actifs",
            value: stats?.services_count || 0, 
            iconColor: "from-purple-500 to-purple-600", 
            icon: <ServerIcon className="w-6 h-6 text-white" />,
            bgGradient: "from-purple-50 to-purple-100",
            borderColor: "border-purple-200"
        },
        { 
            title: "En cours", 
            subtitle: "Traitement actif",
            value: stats?.running || 0, 
            iconColor: "from-green-500 to-green-600", 
            icon: <ArrowPathIcon className="w-6 h-6 text-white animate-spin-slow" />,
            bgGradient: "from-green-50 to-green-100",
            borderColor: "border-green-200"
        },
        { 
            title: "Taux succès", 
            subtitle: "Performance système",
            value: `${successRate}%`, 
            iconColor: "from-emerald-500 to-emerald-600", 
            icon: <ShieldCheckIcon className="w-6 h-6 text-white" />,
            bgGradient: "from-emerald-50 to-emerald-100",
            borderColor: "border-emerald-200"
        },
        { 
            title: "Échecs", 
            subtitle: "Erreurs système",
            value: stats?.failed || 0, 
            iconColor: "from-red-500 to-red-600", 
            icon: <FireIcon className="w-6 h-6 text-white" />,
            bgGradient: "from-red-50 to-red-100",
            borderColor: "border-red-200"
        },
        { 
            title: "Succès", 
            subtitle: "Jobs complétés",
            value: stats?.success || 0, 
            iconColor: "from-teal-500 to-teal-600", 
            icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
            bgGradient: "from-teal-50 to-teal-100",
            borderColor: "border-teal-200"
        },
    ];

    // Fonction pour formater la date
    const formatDate = (date) => {
        if (!date) return 'Jamais';
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        
        if (diff === 0) return `Aujourd'hui à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        if (diff === 1) return 'Hier';
        if (diff < 7) return `Il y a ${diff} jours`;
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Fonction pour obtenir le badge de statut
    const getStatusBadge = (status) => {
        const statuses = {
            'running': { label: 'En cours', color: 'bg-green-500', lightBg: 'bg-green-50', textColor: 'text-green-700', icon: '🔄' },
            'success': { label: 'Succès', color: 'bg-emerald-500', lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', icon: '✅' },
            'failed': { label: 'Échec', color: 'bg-red-500', lightBg: 'bg-red-50', textColor: 'text-red-700', icon: '❌' },
            'pending': { label: 'En attente', color: 'bg-yellow-500', lightBg: 'bg-yellow-50', textColor: 'text-yellow-700', icon: '⏳' },
        };
        const info = statuses[status] || { label: status, color: 'bg-gray-500', lightBg: 'bg-gray-50', textColor: 'text-gray-700', icon: '📌' };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${info.lightBg} ${info.textColor} border border-${info.color.split('-')[1]}-200`}>
                <span>{info.icon}</span>
                {info.label}
            </span>
        );
    };

    // Calcul de la progression de performance
    const performanceScore = Math.round((stats?.success / stats?.total) * 100) || 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Analyste Opérationnel" />

            <div className="p-6 space-y-8 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
                
                {/* HEADER AVEC DATE ET HEURE - BLEU UNIQUEMENT */}
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl overflow-hidden">
                    {/* Décoration d'arrière-plan */}
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -ml-48 -mb-48"></div>
                    
                    <div className="relative z-10 p-8">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg">
                                        <BoltIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-white tracking-tight">
                                        Analyste Opérationnel
                                    </h1>
                                </div>
                                <p className="text-blue-100 text-sm">
                                    Monitoring technique et inventaire des services SMS+
                                </p>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-2.5 shadow-lg border border-white/20">
                                <CalendarIcon className="w-5 h-5 text-blue-200" />
                                <span className="text-white font-medium text-sm">
                                    {new Date().toLocaleDateString('fr-FR', { 
                                        weekday: 'long', 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric' 
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION KPIS */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Indicateurs Système & Business</h2>
                        <p className="text-xs text-gray-500">Performance en temps réel</p>
                    </div>
                </div>

                {/* GRILLE DES CARTES KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                    {kpis.map((kpi, idx) => (
                        <div 
                            key={idx} 
                            className={`group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-l-4 border-l-${kpi.iconColor.split('-')[1]}-500`}
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-50"></div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.iconColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {kpi.icon}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
                                        <p className="text-xs text-gray-400 font-medium">{kpi.subtitle}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{kpi.title}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* SECTION STATISTIQUES AVANCÉES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* Carte de performance */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
                                    <ArrowTrendingUpIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Performance système</h3>
                                    <p className="text-xs text-gray-500">État général du système</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">Taux de succès global</span>
                                    <span className="font-bold text-emerald-600">{performanceScore}%</span>
                                </div>
                                <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-1000 shadow-lg"
                                        style={{ width: `${performanceScore}%` }}
                                    >
                                        <div className="absolute top-0 right-0 w-2 h-full bg-white/30 rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">
                                    {performanceScore >= 80 ? '✅ Excellente performance' : performanceScore >= 60 ? '⚠️ Performance moyenne' : '❌ Performance à améliorer'}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                                    <p className="text-2xl font-bold text-emerald-600">{statusStats.success || 0}</p>
                                    <p className="text-xs text-emerald-600 font-medium mt-1">Succès</p>
                                </div>
                                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                                    <p className="text-2xl font-bold text-red-600">{statusStats.failed || 0}</p>
                                    <p className="text-xs text-red-600 font-medium mt-1">Échecs</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Derniers jobs */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                                        <ClockIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Derniers jobs exécutés</h3>
                                        <p className="text-xs text-gray-500">Activité récente du système</p>
                                    </div>
                                </div>
                                <Link href="/suivi-jobs" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                                    Voir tout <ChevronRightIcon className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                            {latestJobs.length > 0 ? (
                                latestJobs.map((job, index) => (
                                    <div key={index} className="p-4 hover:bg-gray-50 transition-all duration-200 group">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <p className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
                                                        {job.name || `Job #${job.id}`}
                                                    </p>
                                                    {getStatusBadge(job.status)}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <ClockIcon className="w-3 h-3" />
                                                        Dernière mise à jour : {formatDate(job.updated_at)}
                                                    </p>
                                                    {job.created_at !== job.updated_at && (
                                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                                            <CalendarIcon className="w-3 h-3" />
                                                            Créé le : {formatDate(job.created_at)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center">
                                    <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                        <CommandLineIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 font-medium">Aucun job</p>
                                    <p className="text-xs text-gray-400 mt-1">Aucune activité pour le moment</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* DERNIÈRE ACTIVITÉ - HEADER EN BLEU */}
                {lastJob && (
                    <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="relative z-10 p-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                        <BoltIcon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-white/80 font-medium uppercase tracking-wider">Dernière activité système</p>
                                        <p className="text-white font-bold text-lg mt-1">
                                            {lastJob.name || `Job #${lastJob.id}`}
                                        </p>
                                        <p className="text-white/80 text-sm mt-0.5">
                                            Dernière mise à jour : {formatDate(lastJob.updated_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1.5 rounded-lg ${lastJob.status === 'running' ? 'bg-green-500' : lastJob.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'} bg-opacity-20 backdrop-blur-sm flex items-center gap-2`}>
                                        <div className={`w-2 h-2 rounded-full ${lastJob.status === 'running' ? 'bg-green-400 animate-pulse' : lastJob.status === 'failed' ? 'bg-red-400' : 'bg-blue-400'}`}></div>
                                        <span className="text-white text-sm font-medium">
                                            {lastJob.status === 'running' ? 'En cours' : lastJob.status === 'success' ? 'Terminé avec succès' : lastJob.status === 'failed' ? 'Échec' : 'Terminé'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Styles pour les animations */}
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 3s linear infinite;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}