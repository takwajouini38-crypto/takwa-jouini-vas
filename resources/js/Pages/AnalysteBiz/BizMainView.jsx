import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BanknotesIcon, 
    BuildingOffice2Icon, 
    CalendarDaysIcon, 
    BellAlertIcon,
    UserPlusIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

export default function BizMainView({ auth, stats, lastProvider, latestAlerts = [], alertsByMotif = [], revenueByProvider = [], dateRange }) {
    
    // Formatage monétaire en TND (3 décimales pour la précision TT)
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'TND', 
            minimumFractionDigits: 3 
        }).format(val || 0);
    };

    // Formatage de la date
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

    // Badge de motif d'alerte
    const getMotifBadge = (motif) => {
        const motifs = {
            'spike': { label: 'Pic de trafic', color: 'bg-red-100 text-red-800', icon: '📈' },
            'drop': { label: 'Baisse anormale', color: 'bg-orange-100 text-orange-800', icon: '📉' },
            'anomaly': { label: 'Anomalie', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' },
        };
        const info = motifs[motif] || { label: motif || 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: '🔔' };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${info.color}`}>
                <span>{info.icon}</span>
                {info.label}
            </span>
        );
    };

    // Calcul du taux de croissance (exemple)
    const growthRate = revenueByProvider.length > 0 ? 12.5 : 0;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Business - TT" />
            
            <div className="py-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* --- BANNIÈRE --- */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden">
                        <div className="relative p-8">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white mb-2">
                                            Bienvenue, {auth.user.name}
                                        </h1>
                                        <p className="text-blue-100">
                                            Direction Centrale Business — Dashboard VAS SMS+
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                                        <CalendarDaysIcon className="w-5 h-5 text-blue-200" />
                                        <span className="text-white font-medium text-sm">
                                            {dateRange?.start && dateRange?.end ? 
                                                `${new Date(dateRange.start).toLocaleDateString('fr-FR')} - ${new Date(dateRange.end).toLocaleDateString('fr-FR')}` : 
                                                new Date().toLocaleDateString('fr-FR', { 
                                                    weekday: 'long', 
                                                    day: 'numeric', 
                                                    month: 'long', 
                                                    year: 'numeric' 
                                                })
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- GRILLE DE STATISTIQUES --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Carte : Revenu Total */}
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-l-blue-500">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-3 bg-blue-50 rounded-xl">
                                        <BanknotesIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.period_revenue)}</p>
                                        <p className="text-xs text-gray-500">Revenu total</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Revenu de la période</p>
                                </div>
                            </div>
                        </div>

                        {/* Carte : Fournisseurs */}
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-l-emerald-500">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-3 bg-emerald-50 rounded-xl">
                                        <BuildingOffice2Icon className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">{stats.total_providers || 0}</p>
                                        <p className="text-xs text-gray-500">Fournisseurs</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fournisseurs Actifs</p>
                                </div>
                            </div>
                        </div>

                        {/* Carte : Alertes */}
                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-l-4 border-l-amber-500">
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="p-3 bg-amber-50 rounded-xl">
                                        <BellAlertIcon className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-800">{stats.alerts_count || 0}</p>
                                        <p className="text-xs text-gray-500">Alertes totales</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alertes système</p>
                                </div>
                            </div>
                        </div>

                       </div>
                    {/* --- SECTION DERNIÈRES ACTIVITÉS --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Dernier fournisseur créé */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-50 rounded-xl">
                                        <UserPlusIcon className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">Dernier fournisseur</h3>
                                        <p className="text-xs text-gray-500">Dernier ajout</p>
                                    </div>
                                </div>
                            </div>
                            {lastProvider ? (
                                <div className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                                            {lastProvider.name?.charAt(0).toUpperCase() || 'P'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 text-lg">{lastProvider.provider_name || 'Sans nom'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <ClockIcon className="w-4 h-4 text-gray-400" />
                                                <p className="text-xs text-gray-500">
                                                    Créé le {formatDate(lastProvider.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <BuildingOffice2Icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">Aucun fournisseur</p>
                                </div>
                            )}
                        </div>

                        </div>

                   
                       
                </div>
            </div>
        </AuthenticatedLayout>
    );
}