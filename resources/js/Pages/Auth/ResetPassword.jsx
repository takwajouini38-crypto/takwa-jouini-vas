import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { LockClosedIcon, ShieldCheckIcon, CheckCircleIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ResetPassword({ token, email }) {
    const [touched, setTouched] = useState({
        password: false,
        password_confirmation: false
    });
    const [localErrors, setLocalErrors] = useState({
        password: '',
        password_confirmation: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    // Validation en temps réel
    useEffect(() => {
        // Validation du mot de passe
        if (touched.password) {
            if (!data.password) {
                setLocalErrors(prev => ({ ...prev, password: "Le mot de passe est requis." }));
            } else if (data.password.length < 6) {
                setLocalErrors(prev => ({ ...prev, password: "Le mot de passe doit contenir au moins 6 caractères." }));
            } else {
                setLocalErrors(prev => ({ ...prev, password: "" }));
                if (errors.password) clearErrors('password');
            }
        }

        // Validation de la confirmation du mot de passe
        if (touched.password_confirmation) {
            if (!data.password_confirmation) {
                setLocalErrors(prev => ({ ...prev, password_confirmation: "La confirmation du mot de passe est requise." }));
            } else if (data.password !== data.password_confirmation) {
                setLocalErrors(prev => ({ ...prev, password_confirmation: "Les mots de passe ne correspondent pas." }));
            } else {
                setLocalErrors(prev => ({ ...prev, password_confirmation: "" }));
                if (errors.password_confirmation) clearErrors('password_confirmation');
            }
        }
    }, [data.password, data.password_confirmation, touched, errors.password, errors.password_confirmation]);

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
        setTouched({
            password: true,
            password_confirmation: true
        });
        
        // Validation finale avant soumission
        if (!data.password || data.password.length < 6 || !data.password_confirmation || data.password !== data.password_confirmation) {
            return;
        }
        
        post(route('password.store'), {
            onSuccess: () => {
                // Rediriger vers la page de connexion après succès
                router.visit(route('login'), {
                    onFinish: () => {
                        // Optionnel: Afficher un message de succès
                        if (typeof window !== 'undefined') {
                            // Vous pouvez utiliser un toast ou une notification ici
                            console.log('Mot de passe réinitialisé avec succès');
                        }
                    }
                });
            },
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const getFieldStatus = (field) => {
        if (!touched[field]) return null;
        if (field === 'password') {
            if (!data.password) return 'error';
            if (data.password.length < 6) return 'error';
            return 'success';
        }
        if (field === 'password_confirmation') {
            if (!data.password_confirmation) return 'error';
            if (data.password !== data.password_confirmation) return 'error';
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

    // Vérifier si le formulaire est valide
    const isFormValid = () => {
        return data.password && data.password.length >= 6 && 
               data.password_confirmation && data.password === data.password_confirmation;
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
                        {/* Nouveau Mot de passe */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 flex items-center justify-between">
                                <span>Nouveau mot de passe</span>
                                {getFieldStatus('password') === 'success' && (
                                    <span className="text-green-500 text-[10px] font-normal">✓ Valide</span>
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
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    placeholder="••••••••"
                                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white ${getFieldStyles('password')}`}
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                                {getFieldStatus('password') === 'success' && (
                                    <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    </div>
                                )}
                                {getFieldStatus('password') === 'error' && (
                                    <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
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
                            {touched.password && data.password && data.password.length > 0 && data.password.length < 6 && (
                                <div className="mt-2">
                                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-red-500 transition-all duration-300 rounded-full"
                                            style={{ width: `${(data.password.length / 6) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-red-500 mt-1">
                                        Force du mot de passe : Faible (minimum 6 caractères)
                                    </p>
                                </div>
                            )}
                            {touched.password && data.password && data.password.length >= 6 && (
                                <div className="mt-2">
                                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 transition-all duration-300 rounded-full"
                                            style={{ width: `${Math.min((data.password.length / 12) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-green-600 mt-1">
                                        Force du mot de passe : {data.password.length >= 8 ? 'Fort' : 'Moyen'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirmation du mot de passe */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 flex items-center justify-between">
                                <span>Confirmer le mot de passe</span>
                                {getFieldStatus('password_confirmation') === 'success' && (
                                    <span className="text-green-500 text-[10px] font-normal">✓ Correspond</span>
                                )}
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <ShieldCheckIcon className={`h-5 w-5 transition-colors duration-200 ${
                                        getFieldStatus('password_confirmation') === 'success' ? 'text-green-500' : 
                                        getFieldStatus('password_confirmation') === 'error' ? 'text-red-500' : 'text-blue-500/70'
                                    }`} />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={data.password_confirmation}
                                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                    onBlur={() => handleBlur('password_confirmation')}
                                    placeholder="••••••••"
                                    className={`block w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-white ${getFieldStyles('password_confirmation')}`}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                                {getFieldStatus('password_confirmation') === 'success' && (
                                    <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                    </div>
                                )}
                                {getFieldStatus('password_confirmation') === 'error' && (
                                    <div className="absolute inset-y-0 right-0 pr-10 flex items-center pointer-events-none">
                                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                                    </div>
                                )}
                            </div>
                            {(localErrors.password_confirmation && touched.password_confirmation) && (
                                <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                                    <ExclamationCircleIcon className="h-3 w-3" />
                                    {localErrors.password_confirmation}
                                </p>
                            )}
                            {errors.password_confirmation && !localErrors.password_confirmation && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing || !isFormValid()}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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