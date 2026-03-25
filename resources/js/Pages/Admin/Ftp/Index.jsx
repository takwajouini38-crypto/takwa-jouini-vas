import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { 
    CloudIcon, 
    ServerIcon, 
    CheckCircleIcon, 
    ExclamationCircleIcon,
    TrashIcon,
    PencilSquareIcon,
    CheckIcon,
    ArrowsRightLeftIcon
} from "@heroicons/react/24/outline";

export default function Index({ ftps }) {
    const [editing, setEditing] = useState(null);
    const [testStatus, setTestStatus] = useState(null); // 'loading', 'success', 'error'

    const { data, setData, post, put, reset, processing, errors } = useForm({
        name: "",
        host: "",
        port: 21,
        username: "",
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        if (editing) {
            put(route('admin.ftp.update', editing.id), {
                onSuccess: () => { reset(); setEditing(null); }
            });
        } else {
            post(route('admin.ftp.store'), {
                onSuccess: () => reset()
            });
        }
    };

    const handleTestConnection = async () => {
        setTestStatus('loading');
        try {
            const response = await axios.post(route('admin.ftp.test'), data);
            if (response.data.status === 'success') {
                setTestStatus('success');
            } else {
                setTestStatus('error');
            }
        } catch (err) {
            setTestStatus('error');
        }
    };

    const editFtp = (ftp) => {
        setEditing(ftp);
        setData({
            name: ftp.name || "",
            host: ftp.host,
            port: ftp.port,
            username: ftp.username,
            password: "", // On ne remplit pas le mot de passe pour des raisons de sécurité
        });
    };

    return (
        <AuthenticatedLayout title="Configuration FTP">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* FORMULAIRE DE CONFIGURATION */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <CloudIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                {editing ? `Modifier ${editing.name}` : "Ajouter un nouveau serveur FTP"}
                            </h2>
                            <p className="text-xs text-slate-500">Configurez les accès au serveur de fichiers CDR</p>
                        </div>
                    </div>

                    <form onSubmit={submit} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Nom du serveur</label>
                                <input className="w-full rounded-xl border-slate-200 focus:ring-indigo-500" 
                                    placeholder="ex: FTP Principal MMG" value={data.name}
                                    onChange={e => setData("name", e.target.value)} />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Hôte / IP</label>
                                <input className="w-full rounded-xl border-slate-200 focus:ring-indigo-500" 
                                    placeholder="10.x.x.x" value={data.host}
                                    onChange={e => setData("host", e.target.value)} />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Port</label>
                                <input type="number" className="w-full rounded-xl border-slate-200 focus:ring-indigo-500" 
                                    value={data.port} onChange={e => setData("port", e.target.value)} />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Utilisateur</label>
                                <input className="w-full rounded-xl border-slate-200 focus:ring-indigo-500" 
                                    value={data.username} onChange={e => setData("username", e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
                                <input type="password" title="Laissez vide pour conserver l'ancien"
                                    className="w-full rounded-xl border-slate-200 focus:ring-indigo-500" 
                                    value={data.password} onChange={e => setData("password", e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <button type="button" onClick={handleTestConnection}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all">
                                <ArrowsRightLeftIcon className={`w-5 h-5 ${testStatus === 'loading' ? 'animate-spin' : ''}`} />
                                Tester la connexion
                            </button>

                            <div className="flex gap-3">
                                {editing && (
                                    <button type="button" onClick={() => { setEditing(null); reset(); }}
                                        className="px-6 py-2.5 rounded-xl text-slate-500 font-semibold hover:bg-slate-100">
                                        Annuler
                                    </button>
                                )}
                                <button type="submit" disabled={processing}
                                    className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">
                                    {editing ? "Enregistrer les modifications" : "Créer le serveur"}
                                </button>
                            </div>
                        </div>
                        
                        {/* Feedback Test de connexion */}
                        {testStatus === 'success' && <p className="mt-4 text-green-600 text-sm flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Connexion réussie !</p>}
                        {testStatus === 'error' && <p className="mt-4 text-red-600 text-sm flex items-center gap-2"><ExclamationCircleIcon className="w-5 h-5"/> Échec de connexion.</p>}
                    </form>
                </div>

                {/* LISTE DES SERVEURS */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Serveur</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Identifiants</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">État</th>
                                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ftps.map(ftp => (
                                <tr key={ftp.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-700">{ftp.name || 'Sans nom'}</div>
                                        <div className="text-xs text-slate-400">{ftp.host}:{ftp.port}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-medium">
                                        {ftp.username}
                                    </td>
                                    <td className="p-4">
                                        {ftp.is_default ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                <CheckIcon className="w-3.5 h-3.5" /> Actif
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-xs font-bold">
                                                Inactif
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {!ftp.is_default && (
                                            <button onClick={() => router.post(route('admin.ftp.active', ftp.id))}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Activer">
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button onClick={() => editFtp(ftp)}
                                            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => { if(confirm('Supprimer ce serveur ?')) router.delete(route('admin.ftp.destroy', ftp.id)) }}
                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}