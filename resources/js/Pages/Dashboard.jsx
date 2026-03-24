import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import {
    UsersIcon,
    ServerIcon,
    CloudIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {

    const { stats = {} } = usePage().props;

    const modules = [
        {
            title: 'Utilisateurs',
            description: 'Gestion des utilisateurs',
            icon: UsersIcon,
            route: '/admin/users',
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: 'Services SMS',
            description: 'Gestion des services SMS',
            icon: ServerIcon,
            route: '/services',
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Jobs',
            description: 'Suivi des jobs',
            icon: ClockIcon,
            route: '/suivi-jobs',
            color: 'from-yellow-500 to-yellow-600',
        },
        {
            title: 'FTP',
            description: 'Gestion FTP',
            icon: CloudIcon,
            route: '/admin/ftp',
            color: 'from-purple-500 to-purple-600',
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Admin" />

            <div className="p-6 space-y-8">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <h1 className="text-3xl font-bold">Dashboard Admin</h1>
                    <p className="text-sm opacity-80 mt-1">
                        Vue globale du système de gestion
                    </p>
                </div>

                {/* MODULES */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                    {modules.map((m, i) => {
                        const Icon = m.icon;

                        return (
                            <Link
                                key={i}
                                href={m.route}
                                className="group bg-white p-5 rounded-2xl shadow-md border hover:shadow-xl transition transform hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-4">

                                    <div className={`p-3 rounded-xl bg-gradient-to-r ${m.color} text-white shadow`}>
                                        <Icon className="w-6 h-6" />
                                    </div>

                                    <div>
                                        <h2 className="font-semibold text-gray-800 group-hover:text-indigo-600">
                                            {m.title}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            {m.description}
                                        </p>
                                    </div>

                                </div>
                            </Link>
                        );
                    })}

                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
                        <p className="text-gray-500">Utilisateurs</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                            {stats.users ?? 0}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
                        <p className="text-gray-500">Services SMS</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                            {stats.services ?? 0}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md border hover:shadow-lg transition">
                        <p className="text-gray-500">Jobs</p>
                        <p className="text-3xl font-bold text-purple-600 mt-2">
                            {stats.jobs ?? 0}
                        </p>
                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}