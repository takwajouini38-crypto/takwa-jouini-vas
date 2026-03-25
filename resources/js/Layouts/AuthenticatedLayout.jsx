import React, { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import {
    Bars3Icon,
    XMarkIcon,
    ServerIcon,
    UsersIcon,
    HomeIcon,
    Cog6ToothIcon,
    CloudIcon,
    ListBulletIcon
} from '@heroicons/react/24/outline';

import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ children, title }) {

    const pageProps = usePage()?.props || {};
    const user = pageProps.auth?.user || null;

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        {
            label: "ADMINISTRATION",
            items: [
                { name: 'Dashboard Admin', href: route('dashboard'), roles: ['admin'], icon: HomeIcon },
                { name: 'Gestion Utilisateurs', href: route('admin.users.index'), roles: ['admin'], icon: UsersIcon },
            ]
        },
        {
            label: "MONITORING",
            items: [
                { name: 'Suivi Jobs', href: route('job-tasks.dashboard'), roles: ['admin', 'analyst_op'], icon: ListBulletIcon },
                { name: 'Services', href: route('services.index'), roles: ['admin', 'analyst_op'], icon: ServerIcon },
            ]
        },
        {
            label: "CONFIGURATION",
            items: [
                { name: 'Base de Données', href: route('admin.db.index'), roles: ['admin'], icon: Cog6ToothIcon },
                { name: 'FTP', href: route('admin.ftp.index'), roles: ['admin'], icon: CloudIcon },
            ]
        }
    ];

    const isActive = (href) =>
        window.location.pathname === new URL(href, window.location.origin).pathname;

    const handleLogout = () => {
        router.post(route('logout'));
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* SIDEBAR DESKTOP */}
            <aside className="hidden md:flex md:flex-col w-80 bg-white border-r shadow-lg">

                {/* HEADER SIDEBAR */}
                <div className="h-20 flex items-center px-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-md">
                    <div className="leading-tight">
                        <h1 className="text-sm font-bold tracking-wide uppercase">
                            {user.role === 'admin' && 'ADMIN PANEL'}
                            {user.role === 'analyst_op' && 'OPERATION PANEL'}
                            {user.role === 'analyst_biz' && 'BUSINESS PANEL'}
                        </h1>
                        <p className="text-[11px] opacity-80">Management System</p>
                    </div>
                </div>

                {/* NAV */}
                <nav className="flex-1 p-4 space-y-6 overflow-y-auto">

                    {navigation.map((group) => (
                        <div key={group.label}>

                            {/* LABEL */}
                            <p className="text-[11px] font-bold text-gray-400 px-3 mb-2 tracking-wider">
                                {group.label}
                            </p>

                            {/* ITEMS */}
                            <div className="space-y-1">

                                {group.items.map((item) => {
                                    if (!item.roles.includes(user.role)) return null;

                                    const Icon = item.icon;
                                    const active = isActive(item.href);

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                                ${active
                                                    ? 'bg-indigo-600 text-white shadow-md scale-[1.02]'
                                                    : 'text-gray-600 hover:bg-gray-100 hover:scale-[1.01]'
                                                }
                                            `}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.name}
                                        </Link>
                                    );
                                })}

                            </div>
                        </div>
                    ))}

                </nav>

                <div className="p-4 border-t text-[11px] text-gray-400">
                    © 2026 Admin System
                </div>
            </aside>

            {/* MOBILE SIDEBAR */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">

                    <div
                        className="fixed inset-0 bg-black/40"
                        onClick={() => setSidebarOpen(false)}
                    />

                    <aside className="relative w-80 bg-white flex flex-col z-50">

                        <div className="h-16 flex items-center justify-between px-6 bg-indigo-600 text-white">
                            <span className="font-bold">Menu</span>
                            <button onClick={() => setSidebarOpen(false)}>
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="flex-1 p-4 space-y-6">

                            {navigation.map((group) => (
                                <div key={group.label}>

                                    <p className="text-[11px] font-bold text-gray-400 px-3 mb-2">
                                        {group.label}
                                    </p>

                                    <div className="space-y-1">

                                        {group.items.map((item) => {
                                            if (!item.roles.includes(user.role)) return null;

                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100"
                                                    onClick={() => setSidebarOpen(false)}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    {item.name}
                                                </Link>
                                            );
                                        })}

                                    </div>
                                </div>
                            ))}

                        </nav>
                    </aside>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col">

                {/* TOP HEADER */}
                <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b shadow-sm">
                    <div className="h-full flex items-center justify-between px-6">

                        <div className="flex items-center gap-3">

                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-200"
                            >
                                <Bars3Icon className="w-6 h-6 text-gray-700" />
                            </button>

                            <h2 className="text-lg font-semibold text-gray-800 truncate">
                                {title}
                            </h2>
                        </div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <span className="text-sm text-gray-700 font-medium hidden sm:block">
                                        {user.name}
                                    </span>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </Dropdown.Content>
                        </Dropdown>

                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 p-6">
                    {children}
                </main>

            </div>
        </div>
    );
}