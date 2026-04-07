import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CircleStackIcon, ServerIcon, CheckCircleIcon, 
    ExclamationTriangleIcon, ArrowPathIcon, ShieldCheckIcon,
    PencilSquareIcon, TrashIcon, KeyIcon, PlusCircleIcon
} from "@heroicons/react/24/outline";
import axios from 'axios';

export default function DbConfig({ configs = [], auth }) {
    const [testStatus, setTestStatus] = useState(null);
    const [testMessage, setTestMessage] = useState("");
    const [editMode, setEditMode] = useState(false);

    // Initialisation du formulaire avec useForm d'Inertia
    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        id: null,
        host: '',
        port: 1521,
        service_name: '',
        username: '',
        password: '',
        is_active: false,
    });

    // Charger les données dans le formulaire pour modification
    const handleEdit = (config) => {
        clearErrors();
        setEditMode(true);
        setTestStatus(null);
        setData({
            id: config.id,
            host: config.host || '',
            port: config.port || 1521,
            service_name: config.service_name || '',
            username: config.username || '',
            password: '', // On laisse vide par sécurité
            is_active: config.is_active === 1 || config.is_active === true,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editMode) {
            router.post(route('admin.db.update', { id: data.id }), {
                ...data,
                _method: 'put', 
            }, {
                onSuccess: () => {
                    setEditMode(false);
                    reset();
                    setTestStatus(null);
                },
                onError: (errors) => {
                    console.error("Erreurs de validation :", errors);
                }
            });
        } else {
            post(route('admin.db.store'), {
                onSuccess: () => {
                    reset();
                    setTestStatus(null);
                },
            });
        }
    };

    // Suppression d'une ligne
    const handleDelete = (id) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette configuration Oracle ?")) {
            router.post(route('admin.db.destroy', { id: id }), {
                _method: "delete",
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log("Suppression réussie");
                },
                onError: (errors) => {
                    console.error("Erreur lors de la suppression", errors);
                },
            });
        }
    };

    // --- NOUVELLE FONCTION : ACTIVER UN SERVEUR ---
    const handleActivate = (id) => {
        router.post(route('admin.db.active', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                console.log("Serveur activé avec succès");
            }
        });
    };

    // Test de connexion sans enregistrer
    const handleTest = async () => {
        setTestStatus('loading');
        setTestMessage("");
        try {
            const response = await axios.post(route('admin.db.test'), data);
            if (response.data.success) {
                setTestStatus('success');
            } else {
                setTestStatus('error');
                setTestMessage(response.data.message || "Échec du test de connexion.");
            }
        } catch (error) {
            setTestStatus('error');
            setTestMessage(error.response?.data?.message || "Impossible de joindre le serveur Oracle.");
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Configuration Oracle" />
            
            <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
                
                {/* --- SECTION 1 : FORMULAIRE --- */}
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                                <ServerIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-800">
                                    {editMode ? "Modifier la connexion" : "Nouvelle connexion Oracle"}
                                </h2>
                                <p className="text-sm text-slate-500">Configurez l'accès au serveur de données Tunisie Telecom</p>
                            </div>
                        </div>
                        {editMode && (
                            <button 
                                onClick={() => { setEditMode(false); reset(); clearErrors(); }}
                                className="flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                            >
                                <PlusCircleIcon className="w-5 h-5" /> Nouveau
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Paramètres Réseau */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    Paramètres Réseau
                                </h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Hôte (Host IP)</label>
                                    <input 
                                        type="text" 
                                        className={`w-full rounded-2xl border-slate-200 focus:border-orange-500 focus:ring-orange-500 transition-all ${errors.host ? 'border-red-500' : ''}`}
                                        value={data.host} 
                                        onChange={e => setData('host', e.target.value)} 
                                        placeholder="ex: 10.1.2.3"
                                    />
                                    {errors.host && <p className="text-red-500 text-xs mt-1 font-medium">{errors.host}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Port</label>
                                        <input 
                                            type="number" 
                                            className={`w-full rounded-2xl border-slate-200 ${errors.port ? 'border-red-500' : ''}`}
                                            value={data.port} 
                                            onChange={e => setData('port', e.target.value)} 
                                        />
                                        {errors.port && <p className="text-red-500 text-xs mt-1 font-medium">{errors.port}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Service Name (SID)</label>
                                        <input 
                                            type="text" 
                                            className={`w-full rounded-2xl border-slate-200 ${errors.service_name ? 'border-red-500' : ''}`}
                                            value={data.service_name} 
                                            onChange={e => setData('service_name', e.target.value)} 
                                            placeholder="ex: orcl"
                                        />
                                        {errors.service_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.service_name}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Authentification */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    Identifiants & État
                                </h3>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nom d'utilisateur</label>
                                    <input 
                                        type="text" 
                                        className={`w-full rounded-2xl border-slate-200 ${errors.username ? 'border-red-500' : ''}`}
                                        value={data.username} 
                                        onChange={e => setData('username', e.target.value)} 
                                    />
                                    {errors.username && <p className="text-red-500 text-xs mt-1 font-medium">{errors.username}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
                                    <div className="relative">
                                        <input 
                                            type="password" 
                                            className={`w-full rounded-2xl border-slate-200 ${errors.password ? 'border-red-500' : ''}`}
                                            value={data.password} 
                                            onChange={e => setData('password', e.target.value)}
                                            placeholder={editMode ? "•••••••• (Laisser vide pour garder l'actuel)" : ""}
                                        />
                                        <KeyIcon className="w-5 h-5 text-slate-300 absolute right-4 top-3" />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>}
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <input 
                                        type="checkbox" 
                                        id="is_active"
                                        className="w-6 h-6 rounded-lg text-orange-600 focus:ring-orange-500 border-slate-300"
                                        checked={data.is_active} 
                                        onChange={e => setData('is_active', e.target.checked)} 
                                    />
                                    <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer italic">
                                        Définir comme connexion principale (Active)
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Zone de Feedback Test */}
                        {testStatus && testStatus !== 'loading' && (
                            <div className={`mt-8 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300 ${testStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {testStatus === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <ExclamationTriangleIcon className="w-6 h-6" />}
                                <p className="font-bold">{testStatus === 'success' ? "Connexion réussie à Oracle !" : testMessage}</p>
                            </div>
                        )}

                        <div className="mt-10 pt-8 border-t flex flex-col md:flex-row justify-between gap-4">
                            <button 
                                type="button" 
                                onClick={handleTest} 
                                disabled={processing || testStatus === 'loading'}
                                className="px-8 py-3 rounded-2xl border-2 border-slate-200 font-black text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <ArrowPathIcon className={`w-5 h-5 ${testStatus === 'loading' ? 'animate-spin' : ''}`} />
                                {testStatus === 'loading' ? 'TEST EN COURS...' : 'TESTER LA CONNEXION'}
                            </button>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-12 py-3 rounded-2xl bg-orange-600 text-white font-black shadow-lg shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 active:translate-y-0 transition-all uppercase tracking-widest disabled:opacity-50"
                            >
                                {editMode ? "Mettre à jour" : "Enregistrer la config"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* --- SECTION 2 : TABLEAU --- */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b bg-slate-50">
                        <h3 className="font-black text-slate-800 flex items-center gap-3">
                            <CircleStackIcon className="w-6 h-6 text-indigo-500" />
                            GESTION DES SERVEURS ENREGISTRÉS
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-6">Destination</th>
                                    <th className="p-6">Service Name</th>
                                    <th className="p-6">Utilisateur</th>
                                    <th className="p-6 text-center">État</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {configs && configs.length > 0 ? configs.map((config) => (
                                    <tr key={config.id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="p-6">
                                            <div className="font-bold text-slate-700">{config.host}</div>
                                            <div className="text-xs text-slate-400">Port: {config.port}</div>
                                        </td>
                                        <td className="p-6 text-slate-600 font-medium">{config.service_name}</td>
                                        <td className="p-6">
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-mono text-sm uppercase">
                                                {config.username}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            {config.is_active ? (
                                                <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase ring-4 ring-green-50">Actif</span>
                                            ) : (
                                                <span className="text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">Inactif</span>
                                            )}
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            {/* Bouton Activer (Uniquement si inactif) */}
                                            {!config.is_active && (
                                                <button 
                                                    onClick={() => handleActivate(config.id)}
                                                    className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
                                                    title="Définir comme actif"
                                                >
                                                    <ShieldCheckIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleEdit(config)} 
                                                className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                                                title="Modifier"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(config.id)} 
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                title="Supprimer"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <p className="text-slate-400 italic">Aucun serveur Oracle n'est configuré pour le moment.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}