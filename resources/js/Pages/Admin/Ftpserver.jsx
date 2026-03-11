import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function FtpServers({ servers }) {
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [testResult, setTestResult] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        host: '',
        port: 21,
        username: '',
        password: '',
        remote_path: '',
        priority: 1,
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editing) {
            put(route('admin.ftp.update', editing), {
                onSuccess: () => {
                    reset();
                    setEditing(null);
                    setShowForm(false);
                },
            });
        } else {
            post(route('admin.ftp.store'), {
                onSuccess: () => {
                    reset();
                    setShowForm(false);
                },
            });
        }
    };

    const editServer = (server) => {
        setEditing(server.id);
        setData({
            name: server.name,
            host: server.host,
            port: server.port,
            username: server.username,
            password: '',
            remote_path: server.remote_path || '',
            priority: server.priority,
            is_active: server.is_active,
        });
        setShowForm(true);
    };

    const deleteServer = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce serveur ?')) {
            router.delete(route('admin.ftp.destroy', id));
        }
    };

    const testConnection = async () => {
        setTestResult(null);
        try {
            const response = await axios.post(route('admin.ftp.test'), {
                host: data.host,
                port: data.port,
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
            <Head title="Gestion FTP" />
            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-semibold">Gestion des serveurs FTP</h1>
                                <button
                                    onClick={() => {
                                        setEditing(null);
                                        reset();
                                        setShowForm(!showForm);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    {showForm ? 'Annuler' : 'Ajouter un serveur'}
                                </button>
                            </div>

                            {showForm && (
                                <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nom</label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                                required
                                            />
                                            {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                                        </div>
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
                                                required={!editing}
                                            />
                                            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                                            {editing && <p className="text-xs text-gray-500">Laissez vide pour ne pas changer</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Chemin distant</label>
                                            <input
                                                type="text"
                                                value={data.remote_path}
                                                onChange={e => setData('remote_path', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Priorité</label>
                                            <input
                                                type="number"
                                                value={data.priority}
                                                onChange={e => setData('priority', e.target.value)}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.is_active}
                                                    onChange={e => setData('is_active', e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Actif</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex space-x-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            {editing ? 'Mettre à jour' : 'Créer'}
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
                            )}

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hôte</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Port</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actif</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {servers.map(server => (
                                        <tr key={server.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{server.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{server.host}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{server.port}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{server.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{server.priority}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {server.is_active ? 'Oui' : 'Non'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => editServer(server)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                >
                                                    Modifier
                                                </button>
                                                <button
                                                    onClick={() => deleteServer(server.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Supprimer
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}