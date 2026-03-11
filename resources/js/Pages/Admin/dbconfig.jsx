import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function DbConfig({ config }) {
    const [testResult, setTestResult] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        host: config?.host || '',
        port: config?.port || 1521,
        service_name: config?.service_name || '',
        username: config?.username || '',
        password: '',
        is_active: config?.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.db.store'), {
            preserveScroll: true,
        });
    };

    const testConnection = async () => {
        setTestResult(null);
        try {
            const response = await axios.post(route('admin.db.test'), {
                host: data.host,
                port: data.port,
                service_name: data.service_name,
                username: data.username,
                password: data.password,
            });
            setTestResult({ success: true, message: response.data.message });
        } catch (error) {
            setTestResult({ success: false, message: error.response?.data?.message || 'Erreur de connexion' });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Configuration Base de Données" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-semibold mb-4">Configuration de la base de données</h1>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Hôte</label>
                                        <input
                                            type="text"
                                            value={data.host}
                                            onChange={e => setData('host', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                            required
                                        />
                                        {errors.host && <div className="text-red-500 text-sm">{errors.host}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Port</label>
                                        <input
                                            type="number"
                                            value={data.port}
                                            onChange={e => setData('port', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                            required
                                        />
                                        {errors.port && <div className="text-red-500 text-sm">{errors.port}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Service name (SID)</label>
                                        <input
                                            type="text"
                                            value={data.service_name}
                                            onChange={e => setData('service_name', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                            required
                                        />
                                        {errors.service_name && <div className="text-red-500 text-sm">{errors.service_name}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Utilisateur</label>
                                        <input
                                            type="text"
                                            value={data.username}
                                            onChange={e => setData('username', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                            required
                                        />
                                        {errors.username && <div className="text-red-500 text-sm">{errors.username}</div>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                            required={!config}
                                        />
                                        {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                                        {config && <p className="text-xs text-gray-500">Laissez vide pour ne pas changer</p>}
                                    </div>
                                    <div className="flex items-center">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={e => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Configuration active</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Enregistrer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={testConnection}
                                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Tester la connexion
                                    </button>
                                </div>

                                {testResult && (
                                    <div className={`mt-2 p-2 rounded ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {testResult.message}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}