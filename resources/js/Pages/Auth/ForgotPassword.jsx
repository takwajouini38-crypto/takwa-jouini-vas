import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Mot de passe oublié" />

            {/* Conteneur principal avec le même background que le login */}
            <div 
                className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative"
                style={{ backgroundImage: "url('/images/authentification_background (1).png')" }}
            >
                {/* Overlay pour la lisibilité */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>

                {/* Carte de formulaire */}
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
                            Récupération
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Saisissez votre email pour recevoir un lien de réinitialisation.
                        </p>
                    </div>

                    {/* Statut du succès de l'envoi */}
                    {status && (
                        <div className="mb-4 font-medium text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 animate-pulse">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Email professionnel</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-blue-500/70" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nom@tunisietelecom.tn"
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                                    required
                                    autoFocus
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg disabled:opacity-50"
                            >
                                {processing ? "Envoi en cours..." : "Envoyer le lien"}
                            </button>

                            <Link
                                href={route('login')}
                                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors"
                            >
                                <ArrowLeftIcon className="h-4 w-4" />
                                Retour à la connexion
                            </Link>
                        </div>
                    </form>

                    <p className="text-center text-gray-400 text-xs font-medium pt-4">
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