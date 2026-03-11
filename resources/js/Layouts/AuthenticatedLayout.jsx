import React, { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ children, title }) {
    const pageProps = usePage()?.props || {};
    const user = pageProps.auth?.user || null;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ✅ Navigation selon rôle
    const navigation = [
    { name: 'Dashboard', href: route('dashboard'), roles: ['admin', 'analyst_op', 'analyst_biz'] },
    { name: 'Utilisateurs', href: route('admin.users.index'), roles: ['admin'] },  // ← corrigé
    { name: 'Gestion FTP', href: route('admin.ftp.index'), roles: ['admin'] },
    { name: 'Gestion Base de Données', href: route('admin.db.index'), roles: ['admin'] },
    { name: 'Dashboard Opérationnel', href: route('dashboard.op'), roles: ['analyst_op'] },
    { name: 'Dashboard Business', href: route('dashboard.biz'), roles: ['analyst_biz'] },
    { name: 'Suivi des Jobs', href: route('job-tasks.dashboard'), roles: ['analyst_op', 'admin'] },
    { name: 'Gestion des services', href: route('services.index'), roles: ['analyst_op', 'admin'] },
];

    const isActive = (href) => window.location.pathname === new URL(href, window.location.origin).pathname;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Chargement de l'utilisateur...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* Sidebar Desktop */}
            <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-md">
                <div className="h-16 flex items-center px-6 text-2xl font-bold border-b">
                    {user.role === 'admin' && 'Admin Panel'}
                    {user.role === 'analyst_op' && 'Analyste Opérationnel'}
                    {user.role === 'analyst_biz' && 'Analyste Business'}
                </div>
                <nav className="mt-6 flex-1 px-4">
                    {navigation.map(item =>
                        item.roles.includes(user.role) && (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`block py-2 px-4 rounded mt-2 transition ${
                                    isActive(item.href) ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {item.name}
                            </Link>
                        )
                    )}
                </nav>
            </aside>

            {/* Sidebar Mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={() => setSidebarOpen(false)}
                    ></div>

                    <aside className="relative w-64 bg-white shadow-md flex flex-col z-50">
                        <div className="p-6 flex justify-between items-center border-b">
                            <span className="text-xl font-bold">
                                {user.role === 'admin' && 'Admin Panel'}
                                {user.role === 'analyst_op' && 'Analyste Opérationnel'}
                                {user.role === 'analyst_biz' && 'Analyste Business'}
                            </span>
                            <button onClick={() => setSidebarOpen(false)}>
                                <XMarkIcon className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>
                        <nav className="mt-6 flex-1 px-4">
                            {navigation.map(item =>
                                item.roles.includes(user.role) && (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="block py-2 px-4 rounded mt-2 text-gray-700 hover:bg-gray-200"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                )
                            )}
                        </nav>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">

                {/* Top Navbar */}
                <header className="bg-white shadow">
                    <div className="h-16 flex items-center justify-between px-8">

                        {/* Mobile sidebar button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 rounded-md hover:bg-gray-200"
                            >
                                <Bars3Icon className="w-6 h-6 text-gray-700" />
                            </button>
                        </div>

                        {/* Page title */}
                        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

                        {/* Profile Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                        className="w-9 h-9 rounded-full"
                                        alt="avatar"
                                    />
                                    <span className="font-medium">{user.name}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                                <div className="border-t my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </Dropdown.Content>
                        </Dropdown>

                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    <div className="px-8 py-6">{children}</div>
                </main>

            </div>
        </div>
    );
}
