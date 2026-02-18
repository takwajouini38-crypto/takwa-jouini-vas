import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Connexion" />

            <div className="min-h-screen flex items-center justify-center bg-blue-50">
                <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <img
                            src="/images/logotelcom.png"
                            alt="Tunisie Telecom"
                            className="w-36"
                        />
                    </div>

                    <h2 className="text-center text-2xl font-bold text-blue-700">Connexion</h2>

                    {/* Formulaire */}
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                                placeholder="Email"
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                required
                                autoFocus
                            />
                            {errors.email && (
                                <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                            )}
                        </div>

                        <div>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder="Mot de passe"
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                required
                            />
                            {errors.password && (
                                <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-700">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={e => setData('remember', e.target.checked)}
                                    className="h-4 w-4"
                                />
                                Se souvenir de moi
                            </label>

                            <Link
                                href={route('password.request')}
                                className="text-blue-600 hover:underline"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition"
                        >
                            Se connecter
                        </button>
                    </form>

                    <p className="text-center text-gray-500 text-sm">
                        © {new Date().getFullYear()} Tunisie Telecom
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
