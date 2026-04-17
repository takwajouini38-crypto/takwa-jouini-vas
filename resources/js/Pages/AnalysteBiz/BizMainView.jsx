import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { 
    BanknotesIcon, 
    BuildingOffice2Icon, 
    CalendarDaysIcon, 
    CircleStackIcon 
} from '@heroicons/react/24/outline';

export default function BizMainView({ auth, stats, startDate, endDate, revenueByProvider = [] }) {
    
    // Formatage monétaire en TND (3 décimales pour la précision TT)
    const formatCurrency = (val) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'TND', 
            minimumFractionDigits: 3 
        }).format(val || 0);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard Business - TT" />
            
            <div className="py-12 bg-[#f8fafc] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* --- BANNIÈRE STYLE ADMIN (Indigo uni) --- */}
                    <div className="bg-[#6366f1] rounded-2xl p-10 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold">Bienvenue, {auth.user.name}</h1>
                            <p className="text-indigo-100 mt-2 text-lg">Direction Centrale Business — Dashboard VAS SMS+</p>
                        </div>
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>

                    {/* --- GRILLE DE STATISTIQUES (Utilise l'objet stats du contrôleur) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        
                        {/* Carte : Revenu Total (Calculé en PHP) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 transition-all hover:shadow-md">
                            <div className="p-4 bg-blue-500 rounded-xl shadow-md shadow-blue-100">
                                <BanknotesIcon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">Revenu de la période</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(stats.period_revenue)}
                                </p>
                            </div>
                        </div>

                        {/* Carte : Fournisseurs (Calculé en PHP) */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-6 transition-all hover:shadow-md">
                            <div className="p-4 bg-emerald-500 rounded-xl shadow-md shadow-emerald-100">
                                <BuildingOffice2Icon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <p className="text-gray-500 font-medium text-sm uppercase tracking-wider">Fournisseurs Actifs</p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    {stats.total_providers}
                                </p>
                            </div>
                        </div>

                       

                    </div>


                </div>
            </div>
        </AuthenticatedLayout>
    );
}