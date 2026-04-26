import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const [touched, setTouched] = useState({
        email: false,
        password: false
    });
    
    const [localErrors, setLocalErrors] = useState({
        email: '',
        password: ''
    });

    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Validation en temps réel
    useEffect(() => {
        // Validation Email
        if (touched.email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!data.email) {
                setLocalErrors(prev => ({ ...prev, email: "L'adresse email est requise." }));
            } else if (!emailRegex.test(data.email)) {
                setLocalErrors(prev => ({ ...prev, email: "Format d'email invalide. Exemple: nom@domaine.com" }));
            } else {
                setLocalErrors(prev => ({ ...prev, email: "" }));
                if (errors.email) clearErrors('email');
            }
        }

        // Validation Mot de passe
        if (touched.password) {
            if (!data.password) {
                setLocalErrors(prev => ({ ...prev, password: "Le mot de passe est requis." }));
            } else {
                setLocalErrors(prev => ({ ...prev, password: "" }));
                if (errors.password) clearErrors('password');
            }
        }
    }, [data, touched, errors.email, errors.password]);

    const handleChange = (field, value) => {
        setData(field, value);
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const submit = (e) => {
        e.preventDefault();
        
        // Marquer tous les champs comme touchés
        setTouched({ email: true, password: true });
        
        // Validation finale avant soumission
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!data.email || !emailRegex.test(data.email) || !data.password) {
            return;
        }
        
        post(route('login'));
    };

    const getFieldStatus = (field) => {
        if (!touched[field]) return null;
        if (field === 'email') {
            if (!data.email) return 'error';
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(data.email)) return 'error';
            return 'success';
        }
        if (field === 'password') {
            if (!data.password) return 'error';
            return 'success';
        }
        return null;
    };

    const getFieldStyles = (field) => {
        const status = getFieldStatus(field);
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
            <Head title="Connexion" />

            {/* Conteneur principal avec l'image de background personnalisée */}
            <div 
                className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative"
                style={{ backgroundImage: "url('/images/authentification_background (1).png')" }}
            >
                {/* Overlay léger pour s'assurer que le formulaire reste bien lisible sur le fond blanc */}
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>

                {/* Carte de connexion */}
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
    <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
       <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">   Bienvenue sur TT Smart</span>
    </h2>
    <p className="mt-2 text-base font-light text-slate-500">
         <span className="font-semibold text-slate-700">Monitoring  — Analyse & Performance </span> 
    </p>
    
</div>
                    {/* Formulaire */}
                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 flex items-center justify-between">
                                <span>Email professionnel</span>
                                {getFieldStatus('email') === 'success' && (
                                    <span className="text-green-500 text-[10px] font-normal">✓ Valide</span>
                                )}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className={`h-5 w-5 transition-colors duration-200 ${
                                        getFieldStatus('email') === 'success' ? 'text-green-500' : 
                                        getFieldStatus('email') === 'error' ? 'text-red-500' : 'text-blue-500/70'
                                    }`} />
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    placeholder="nom@tunisietelecom.tn"
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white ${getFieldStyles('email')}`}
                                    autoFocus
                                />
                                {getFieldStatus('email') === 'success' && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    </div>
                                )}
                                {getFieldStatus('email') === 'error' && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {(localErrors.email && touched.email) && (
                                <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                                    <ExclamationCircleIcon className="h-3 w-3" />
                                    {localErrors.email}
                                </p>
                            )}
                            {errors.email && !localErrors.email && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 flex items-center justify-between">
                                <span>Mot de passe</span>
                                {getFieldStatus('password') === 'success' && (
                                    <span className="text-green-500 text-[10px] font-normal">✓ Rempli</span>
                                )}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className={`h-5 w-5 transition-colors duration-200 ${
                                        getFieldStatus('password') === 'success' ? 'text-green-500' : 
                                        getFieldStatus('password') === 'error' ? 'text-red-500' : 'text-blue-500/70'
                                    }`} />
                                </div>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={e => handleChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    placeholder="••••••••"
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white ${getFieldStyles('password')}`}
                                />
                                {getFieldStatus('password') === 'success' && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    </div>
                                )}
                                {getFieldStatus('password') === 'error' && (
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {(localErrors.password && touched.password) && (
                                <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                                    <ExclamationCircleIcon className="h-3 w-3" />
                                    {localErrors.password}
                                </p>
                            )}
                            {errors.password && !localErrors.password && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-600 cursor-pointer hover:text-blue-600 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span>Se souvenir de moi</span>
                            </label>

                            <Link
                                href={route('password.request')}
                                className="text-blue-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Vérification...
                                </span>
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Copyright */}
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