import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    UsersIcon,
    CloudIcon,
    CircleStackIcon,
    ClockIcon,
    UserPlusIcon,
    ServerIcon,
    ArrowTrendingUpIcon,
    CheckBadgeIcon,
    CalendarIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
    const { stats = {}, latestUsers = [], latestDbConfigs = [], latestFtpConfigs = [], lastActivity = {} } = usePage().props;

    const modules = [
        {
            title: 'Utilisateurs',
            description: 'Gestion des utilisateurs',
            icon: UsersIcon,
            route: '/admin/users',
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            count: stats.users
        },
        {
            title: 'Base de Données',
            description: 'Configuration Oracle',
            icon: CircleStackIcon, // Correction ici
            route: '/admin/db',
            color: 'from-green-500 to-green-600',
            bgColor: 'bg-green-50',
            textColor: 'text-green-600',
            count: stats.db_configs
        },
        {
            title: 'FTP',
            description: 'Gestion des serveurs FTP',
            icon: CloudIcon,
            route: '/admin/ftp',
            color: 'from-purple-500 to-purple-600',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            count: stats.ftp_configs
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

    // Fonction pour obtenir l'icône du rôle
    const getRoleIcon = (role) => {
        switch(role) {
            case 'admin': return '👑';
            case 'analyst_biz': return '📊';
            case 'analyst_op': return '📈';
            default: return '👤';
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Admin" />

            <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
                
                {/* HEADER AVEC DATE ET HEURE */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl overflow-hidden">
                    <div className="relative p-8">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">
                                        Tableau de bord
                                    </h1>
                                    <p className="text-blue-100">
                                        Vue globale du système de gestion VAS SMS+
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                                    <CalendarIcon className="w-5 h-5 text-blue-200" />
                                    <span className="text-white font-medium">
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
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modules.map((m, i) => {
                        const Icon = m.icon;
                        return (
                            <Link
                                key={i}
                                href={m.route}
                                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${m.bgColor} ${m.textColor} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-bold text-gray-800">{m.count || 0}</p>
                                            <p className="text-xs text-gray-500">Total</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 text-lg">{m.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{m.description}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between text-sm">
                                        <span className={`${m.textColor} font-medium`}>Gérer</span>
                                        <ChevronRightIcon className={`w-4 h-4 ${m.textColor} group-hover:translate-x-1 transition-transform`} />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* DERNIÈRE ACTIVITÉ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <ClockIcon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Dernière activité</h2>
                                    <p className="text-sm text-gray-500">Historique des dernières modifications</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Dernier utilisateur */}
                            {lastActivity.user && (
                                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                                            {getRoleIcon(lastActivity.user.role)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{lastActivity.user.name}</p>
                                            <p className="text-xs text-gray-500">Nouvel utilisateur créé</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{formatDate(lastActivity.user.created_at)}</p>
                                        <p className="text-xs text-blue-600">{lastActivity.user.email}</p>
                                    </div>
                                </div>
                            )}

                            {/* Dernière config DB */}
                            {lastActivity.db && (
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <CircleStackIcon className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Configuration Oracle</p>
                                            <p className="text-xs text-gray-500">{lastActivity.db.host}:{lastActivity.db.port}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{formatDate(lastActivity.db.created_at)}</p>
                                        <p className="text-xs text-green-600">SID: {lastActivity.db.service_name}</p>
                                    </div>
                                </div>
                            )}

                            {/* Dernière config FTP */}
                            {lastActivity.ftp && (
                                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <CloudIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Configuration FTP</p>
                                            <p className="text-xs text-gray-500">{lastActivity.ftp.host}:{lastActivity.ftp.port}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{formatDate(lastActivity.ftp.created_at)}</p>
                                        <p className="text-xs text-purple-600">Utilisateur: {lastActivity.ftp.username}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* STATS RAPIDES */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-md p-6 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <ArrowTrendingUpIcon className="w-6 h-6" />
                            <h3 className="text-lg font-bold">Aperçu rapide</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                                <span>Utilisateurs totaux</span>
                                <span className="text-2xl font-bold">{stats.users || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                                <span>Configurations DB</span>
                                <span className="text-2xl font-bold">{stats.db_configs || 0}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                                <span>Configurations FTP</span>
                                <span className="text-2xl font-bold">{stats.ftp_configs || 0}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span>Statut système</span>
                                <span className="flex items-center gap-1 text-green-300">
                                    <CheckBadgeIcon className="w-5 h-5" />
                                    Actif
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            
                    </div>
        </AuthenticatedLayout>
    );
}