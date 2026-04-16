import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Réinitialiser le mot de passe" />

            {/* Background avec l'image TT personnalisée */}
            <div 
                className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative"
                style={{ backgroundImage: "url('/images/authentification_background (1).png')" }}
            >
                {/* Overlay pour la lisibilité (Glassmorphism) */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>

                {/* Carte de formulaire stylisée */}
                <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 z-10 transform transition-all duration-500 animate-fade-up">
                    
                    {/* Logo Tunisie Telecom */}
                    <div className="flex justify-center">
                        <img
                            src="/images/logotelcom.png"
                            alt="Tunisie Telecom"
                            className="w-48 h-auto transition-transform hover:scale-105 duration-300"
                        />
                    </div>

                    <div className="text-center">
                        <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                            Nouveau mot de passe
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sécurisez votre compte professionnel
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-5">
                        {/* Email (Lecture seule pour plus de sécurité) */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    readOnly
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Nouveau Mot de passe */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Nouveau mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-blue-500/70" />
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirmation du mot de passe */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Confirmer le mot de passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ShieldCheckIcon className="h-5 w-5 text-blue-500/70" />
                                </div>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                    required
                                />
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg disabled:opacity-50"
                        >
                            {processing ? "Mise à jour..." : "Réinitialiser le mot de passe"}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 text-xs font-medium">
                        © {new Date().getFullYear()} Tunisie Telecom. Tous droits réservés.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </GuestLayout>
    );
}