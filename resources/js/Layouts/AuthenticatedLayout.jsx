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
    ListBulletIcon,
    ChartBarIcon,
    TrophyIcon, // Nouvelle icône pour Top 20
    MagnifyingGlassIcon // Nouvelle icône pour Recherche
} from '@heroicons/react/24/outline';

import Dropdown from '@/Components/Dropdown';

export default function AuthenticatedLayout({ children, title }) {
    const pageProps = usePage()?.props || {};
    const user = pageProps.auth?.user || null;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Définition du menu mis à jour pour l'Analyste Business
    const navigation = [
        {
            label: "ADMINISTRATION",
            items: [
                { name: 'Dashboard Admin', href: '/dashboard', roles: ['admin'], icon: HomeIcon },
                { name: 'Gestion Utilisateurs', href: '/admin/users', roles: ['admin'], icon: UsersIcon },
            ]
        },
        // --- NOUVELLE SECTION RÉSERVÉE À L'ANALYSTE BIZ ---
       {
            label: "PORTAIL BUSINESS",
            items: [
                { 
                    name: 'Vue Principale Biz', 
                    href: '/biz-dashboard', // L'URL définie dans votre web.php
                    roles: ['analyst_biz'], // Accessible UNIQUEMENT par l'analyste biz
                    icon: HomeIcon 
                },
            ]
        },
        {
            label: "MONITORING",
            items: [
                { name: 'Suivi Jobs', href: '/suivi-jobs', roles: ['admin', 'analyst_op'], icon: ListBulletIcon },
                { name: 'Services', href: '/services', roles: ['admin', 'analyst_op'], icon: ServerIcon },
            ]
        },
        {
            label: "CONFIGURATION",
            items: [
                { name: 'Base de Données', href: '/admin/db', roles: ['admin'], icon: Cog6ToothIcon },
                { name: 'FTP', href: '/admin/ftp', roles: ['admin'], icon: CloudIcon },
            ]
        },
        {
            label: "ANALYSES & INSIGHTS (VAS)",
            items: [
                { 
                    name: 'Analyses de Revenus', 
                    href: '/analyste-biz/analytics', 
                    roles: ['admin', 'analyst_biz'], 
                    icon: ChartBarIcon 
                },
                { 
                    name: 'Top 20 Services', 
                    href: '/analyste-biz/top-services', 
                    roles: ['admin', 'analyst_biz'], 
                    icon: TrophyIcon 
                },
                { 
                    name: 'Recherche MSISDN', 
                    href: '/analyste-biz/search', 
                    roles: ['admin', 'analyst_biz'], 
                    icon: MagnifyingGlassIcon 
                },
            ]
        }
    ];

    const isActive = (href) => window.location.pathname === href;

    const handleLogout = () => {
        router.post('/logout');
    };

    if (!user) return null;

    return (
        <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
            {/* SIDEBAR DESKTOP */}
            <aside className="hidden md:flex md:flex-col w-80 bg-white border-r flex-shrink-0">
                <div className="h-16 flex items-center px-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex-shrink-0">
                    <div className="leading-tight">
                        <h1 className="text-sm font-bold uppercase">
                            {user.role === 'admin' ? 'ADMIN PANEL' : 'TT MONITORING'}
                        </h1>
                        <p className="text-[11px] opacity-80">VAS SMS+ Insights</p>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                    {navigation.map((group) => {
                        // On vérifie si l'utilisateur a accès à au moins un item du groupe
                        const hasAccessToGroup = group.items.some(item => item.roles.includes(user.role));
                        if (!hasAccessToGroup) return null;

                        return (
                            <div key={group.label}>
                                <p className="text-[11px] font-bold text-gray-400 px-3 mb-2 uppercase tracking-wider">{group.label}</p>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        if (!item.roles.includes(user.role)) return null;
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${active ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                {item.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>
            </aside>

            {/* ZONE CONTENU (DROITE) */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-40 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                            <Bars3Icon className="w-6 h-6 text-gray-700" />
                        </button>
                        <h2 className="text-lg font-semibold text-gray-800 tracking-tight">{title}</h2>
                    </div>

                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-100">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-xs text-gray-400 leading-none mb-1 uppercase font-bold">{user.role}</p>
                                    <p className="text-sm text-gray-700 font-medium leading-none">{user.name}</p>
                                </div>
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href="/profile">Mon Profil</Dropdown.Link>
                            <hr className="my-1 border-gray-100" />
                            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium">
                                Déconnexion
                            </button>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* MOBILE SIDEBAR (Utilise le même mapping navigation) */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <aside className="relative w-80 bg-white h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="h-16 flex items-center justify-between px-6 bg-indigo-600 text-white">
                            <span className="font-bold tracking-wider">TT MONITORING</span>
                            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                            {navigation.map((group) => {
                                if (!group.items.some(item => item.roles.includes(user.role))) return null;
                                return (
                                    <div key={group.label}>
                                        <p className="text-[11px] font-bold text-gray-400 px-3 mb-2 uppercase tracking-widest">{group.label}</p>
                                        <div className="space-y-1">
                                            {group.items.map((item) => {
                                                if (!item.roles.includes(user.role)) return null;
                                                const Icon = item.icon;
                                                const active = isActive(item.href);
                                                return (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${active ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                    >
                                                        <Icon className="w-5 h-5" />
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>
                    </aside>
                </div>
            )}
        </div>
    );
}