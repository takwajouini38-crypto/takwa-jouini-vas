import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

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

    // 🔥 CHECK LOGIN (EMAIL + PASSWORD)
    const checkLoginServer = async () => {
        try {
            const response = await axios.post(route('api.login.check'), {
                email: data.email,
                password: data.password
            });

            if (!response.data.valid) {
                setLocalErrors(prev => ({
                    ...prev,
                    password: "Email ou mot de passe incorrect"
                }));
            } else {
                setLocalErrors(prev => ({
                    ...prev,
                    password: ""
                }));
            }
        } catch (error) {
            console.error("Erreur serveur login check");
        }
    };

    useEffect(() => {

        // ✅ Validation EMAIL
        if (touched.email) {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (!data.email) {
                setLocalErrors(prev => ({ ...prev, email: "L'adresse email est requise." }));
            } else if (!emailRegex.test(data.email)) {
                setLocalErrors(prev => ({ ...prev, email: "Format d'email invalide." }));
            } else {
                setLocalErrors(prev => ({ ...prev, email: "" }));
                if (errors.email) clearErrors('email');
            }
        }

        // ✅ Validation PASSWORD (local)
        if (touched.password) {
            if (!data.password) {
                setLocalErrors(prev => ({ ...prev, password: "Le mot de passe est requis." }));
           
            } else {
                setLocalErrors(prev => ({ ...prev, password: "" }));
                if (errors.password) clearErrors('password');
            }
        }

        // 🔥 DEBOUNCE LOGIN CHECK
        const timerLogin = setTimeout(() => {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

            if (
                touched.email &&
                touched.password &&
                emailRegex.test(data.email) &&
                data.password.length >= 8
            ) {
                checkLoginServer();
            }
        }, 800);

        return () => clearTimeout(timerLogin);

    }, [data, touched]);

    const handleChange = (field, value) => {
        setData(field, value);
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const submit = (e) => {
        e.preventDefault();

        setTouched({ email: true, password: true });

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!data.email || !emailRegex.test(data.email) || !data.password) {
            return;
        }

        if (localErrors.password) return;

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

            <div 
                className="min-h-screen flex items-center justify-center bg-no-repeat bg-cover bg-center relative"
                style={{ backgroundImage: "url('/images/authentification_background (1).png')" }}
            >
                <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]"></div>

                <div className="w-full max-w-md p-8 space-y-8 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 z-10 transform transition-all duration-500 animate-fade-up">

                    <div className="flex justify-center">
                        <img
                            src="/images/logotelcom.png"
                            alt="Tunisie Telecom"
                            className="w-48 h-auto transition-transform hover:scale-105 duration-300"
                        />
                    </div>

                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Bienvenue sur TT Smart
                            </span>
                        </h2>
                        <p className="mt-2 text-base font-light text-slate-500">
                            <span className="font-semibold text-slate-700">
                                Monitoring — Analyse & Performance
                            </span>
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">

                        {/* EMAIL */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                                Email professionnel
                            </label>

                            <input
                                type="email"
                                value={data.email}
                                onChange={e => handleChange('email', e.target.value)}
                                onBlur={() => handleBlur('email')}
                                placeholder="nom@tunisietelecom.tn"
                                className={`block w-full pl-10 pr-3 py-3 border rounded-xl ${getFieldStyles('email')}`}
                            />

                            {localErrors.email && (
                                <p className="text-red-500 text-xs mt-1">{localErrors.email}</p>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                                Mot de passe
                            </label>

                            <input
                                type="password"
                                value={data.password}
                                onChange={e => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                placeholder="••••••••"
                                className={`block w-full pl-10 pr-3 py-3 border rounded-xl ${getFieldStyles('password')}`}
                            />

                            {localErrors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {localErrors.password}
                                </p>
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
                            className="w-full py-3 bg-blue-600 text-white rounded-xl"
                        >
                            Se connecter
                        </button>

                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}