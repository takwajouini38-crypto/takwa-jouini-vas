import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword({ status }) {
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState('');

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
    });

    // Validation en temps réel
    useEffect(() => {
        if (touched) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!data.email) {
                setLocalError("L'adresse email est requise.");
            } else if (!emailRegex.test(data.email)) {
                setLocalError("Format d'email invalide. Exemple: nom@domaine.com");
            } else {
                setLocalError("");
                if (errors.email) clearErrors('email');
            }
        }
    }, [data.email, touched, errors.email]);

    const handleChange = (e) => {
        setData('email', e.target.value);
        if (!touched) setTouched(true);
    };

    const handleBlur = () => {
        setTouched(true);
    };

    const submit = (e) => {
        e.preventDefault();
        
        // Marquer comme touché
        setTouched(true);
        
        // Validation finale avant soumission
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!data.email || !emailRegex.test(data.email)) {
            return;
        }
        
        post(route('password.email'));
    };

    const getFieldStatus = () => {
        if (!touched) return null;
        if (!data.email) return 'error';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(data.email)) return 'error';
        return 'success';
    };

    const getFieldStyles = () => {
        const status = getFieldStatus();
        if (status === 'success') {
            return 'border-green-400 focus:ring-green-500 focus:border-green-500 pr-10';
        }
        if (status === 'error') {
            return 'border-red-400 focus:ring-red-500 focus:border-red-500 bg-red-50 pr-10';
        }
        return 'border-gray-200 focus:ring-blue-500 focus:border-blue-500';
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
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 flex items-center justify-between">
                                <span>Email professionnel</span>
                                {getFieldStatus() === 'success' && (
                                    <span className="text-green-500 text-[10px] font-normal">✓ Valide</span>
                                )}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className={`h-5 w-5 transition-colors duration-200 ${
                                        getFieldStatus() === 'success' ? 'text-green-500' : 
                                        getFieldStatus() === 'error' ? 'text-red-500' : 'text-blue-500/70'
                                    }`} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="nom@tunisietelecom.tn"
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white ${getFieldStyles()}`}
                                    autoFocus
                                />
                                {getFieldStatus() === 'success' && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    </div>
                                )}
                                {getFieldStatus() === 'error' && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {(localError && touched) && (
                                <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                                    <ExclamationCircleIcon className="h-3 w-3" />
                                    {localError}
                                </p>
                            )}
                            {errors.email && !localError && (
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