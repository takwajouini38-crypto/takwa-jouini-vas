import React, { useState, useEffect } from "react";
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
    ArrowsRightLeftIcon,
    XMarkIcon,
    InformationCircleIcon,
    KeyIcon
} from "@heroicons/react/24/outline";
import axios from "axios";

// Modal de confirmation pour suppression
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, ftp }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                            <TrashIcon className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Supprimer le serveur FTP</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Êtes-vous sûr de vouloir supprimer ce serveur FTP ?
                    </p>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CloudIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Nom :</span>
                                <span className="font-mono text-gray-900 font-bold">{ftp?.name || 'Sans nom'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <ServerIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Hôte :</span>
                                <span className="font-mono text-gray-900 font-bold">{ftp?.host}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-600 font-medium">Port :</span>
                                <span className="font-mono text-gray-900">{ftp?.port}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <KeyIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Utilisateur :</span>
                                <span className="font-mono text-gray-900">{ftp?.username}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                        <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-700">
                            <p className="font-bold mb-1">⚠️ Action irréversible</p>
                            <p>Toutes les données associées à ce serveur FTP seront définitivement supprimées.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 p-6 pt-0">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200">
                        Annuler
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg">
                        Oui, supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal de confirmation pour Enregistrement/Mise à jour
const ActionConfirmModal = ({ isOpen, onClose, onConfirm, action, ftp }) => {
    if (!isOpen) return null;

    const isUpdate = action === 'update';
    const title = isUpdate ? "Modifier le serveur FTP" : "Nouveau serveur FTP";
    const icon = isUpdate ? PencilSquareIcon : CloudIcon;
    const confirmText = isUpdate ? "Mettre à jour" : "Enregistrer";
    const confirmColor = isUpdate ? "bg-indigo-500 hover:bg-indigo-600" : "bg-indigo-600 hover:bg-indigo-700";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUpdate ? 'bg-indigo-50' : 'bg-indigo-50'}`}>
                            {React.createElement(icon, { className: `w-5 h-5 text-indigo-500` })}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        {isUpdate 
                            ? "Êtes-vous sûr de vouloir modifier ce serveur FTP ?"
                            : "Êtes-vous sûr de vouloir créer un nouveau serveur FTP ?"
                        }
                    </p>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <CloudIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Nom :</span>
                                <span className="font-mono text-gray-900 font-bold">{ftp?.name || 'Sans nom'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <ServerIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Hôte :</span>
                                <span className="font-mono text-gray-900 font-bold">{ftp?.host}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-600 font-medium">Port :</span>
                                <span className="font-mono text-gray-900">{ftp?.port}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <KeyIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Utilisateur :</span>
                                <span className="font-mono text-gray-900">{ftp?.username}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`flex items-start gap-3 p-3 rounded-xl border bg-indigo-50 border-indigo-100`}>
                        <InformationCircleIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-indigo-700">
                            <p className="font-bold mb-1">ℹ️ Confirmation requise</p>
                            <p>Veuillez vérifier les informations avant de {isUpdate ? 'modifier' : 'enregistrer'}.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 p-6 pt-0">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200">
                        Annuler
                    </button>
                    <button onClick={onConfirm} className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white ${confirmColor} rounded-xl transition-all duration-200 shadow-md hover:shadow-lg`}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal de succès
const SuccessModal = ({ isOpen, onClose, message, action }) => {
    if (!isOpen) return null;

    const getActionText = () => {
        switch(action) {
            case 'create': return 'créé';
            case 'update': return 'modifié';
            case 'delete': return 'supprimé';
            default: return 'effectué';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Succès !</h3>
                    <p className="text-gray-600 mb-6">
                        Le serveur FTP a été {getActionText()} avec succès.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-md"
                    >
                        Continuer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Index({ ftps }) {
    const [editing, setEditing] = useState(null);
    const [testStatus, setTestStatus] = useState(null);
    const [touched, setTouched] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [ftpToDelete, setFtpToDelete] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successAction, setSuccessAction] = useState('');
    const [pendingSubmit, setPendingSubmit] = useState(false);

    const { data, setData, post, put, reset, processing, errors, setError, clearErrors } = useForm({
        name: "",
        host: "",
        port: 21,
        username: "",
        password: "",
    });

    // Validation en temps réel
    useEffect(() => {
        // Validation Nom
        if (touched.name && !data.name) {
            setError('name', "Le nom du serveur est requis.");
        } else if (touched.name) {
            clearErrors('name');
        }

        // Validation Hôte
        if (touched.host) {
            const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
            const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!data.host) {
                setError('host', "L'hôte est requis.");
            } else if (!ipRegex.test(data.host) && !domainRegex.test(data.host)) {
                setError('host', "Format invalide (IP ou domaine valide requis).");
            } else {
                clearErrors('host');
            }
        }

        // Validation Port
        if (touched.port) {
            const portNum = parseInt(data.port);
            if (!data.port) {
                setError('port', "Le port est requis.");
            } else if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                setError('port', "Le port doit être compris entre 1 et 65535.","Le port est requis.");
            } else {
                clearErrors('port');
            }
        }

        // Validation Utilisateur
        if (touched.username && !data.username) {
            setError('username', "L'utilisateur est requis.");
        } else if (touched.username) {
            clearErrors('username');
        }

        // Validation Mot de passe
        if (touched.password) {
            if (!editing && !data.password) {
                setError('password', "Le mot de passe est obligatoire pour un nouveau serveur.");
            } else if (data.password && data.password.length < 3) {
                setError('password', "Mot de passe trop court.");
            } else {
                clearErrors('password');
            }
        }
    }, [data, touched, editing]);

    const handleChange = (field, value) => {
        setData(field, value);
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleTestConnection = async () => {
        if (errors.host || errors.port) return;

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
        clearErrors();
        setTouched({});
        setEditing(ftp);
        setData({
            name: ftp.name || "",
            host: ftp.host,
            port: ftp.port,
            username: ftp.username,
            password: "", 
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const validateForm = () => {
        const fields = { name: true, host: true, port: true, username: true, password: true };
        setTouched(fields);

        const portNum = parseInt(data.port);
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (!data.name || !data.host || isNaN(portNum) || portNum < 1 || portNum > 65535 || !data.username || (!editing && !data.password)) {
            return false;
        }
        
        if (!ipRegex.test(data.host) && !domainRegex.test(data.host)) {
            return false;
        }
        
        return true;
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setPendingSubmit(true);
        setShowConfirmModal(true);
    };

    const confirmSubmit = () => {
        setShowConfirmModal(false);
        
        if (editing) {
            put(route('admin.ftp.update', editing.id), {
                onSuccess: () => { 
                    reset(); 
                    setEditing(null);
                    setTouched({});
                    setSuccessAction('update');
                    setShowSuccessModal(true);
                    setPendingSubmit(false);
                },
                onError: () => {
                    setPendingSubmit(false);
                }
            });
        } else {
            post(route('admin.ftp.store'), {
                onSuccess: () => {
                    reset();
                    setTouched({});
                    setSuccessAction('create');
                    setShowSuccessModal(true);
                    setPendingSubmit(false);
                },
                onError: () => {
                    setPendingSubmit(false);
                }
            });
        }
    };

    const handleDelete = (ftp) => {
        setFtpToDelete(ftp);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (ftpToDelete) {
            router.post(route('admin.ftp.destroy', ftpToDelete.id), {
                _method: 'delete',
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setFtpToDelete(null);
                    setSuccessAction('delete');
                    setShowSuccessModal(true);
                },
                onError: (err) => {
                    console.error("Erreur lors de la suppression", err);
                }
            });
        }
    };

    const ErrorMsg = ({ field }) => (
        errors[field] && touched[field] ? <p className="text-red-600 text-[11px] mt-1 font-bold animate-pulse">⚠️ {errors[field]}</p> : null
    );

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
                                <input className={`w-full rounded-xl border-slate-200 focus:ring-indigo-500 ${errors.name && touched.name ? 'border-red-500 bg-red-50' : ''}`}
                                    placeholder="ex: FTP Principal MMG" value={data.name}
                                    onChange={e => handleChange("name", e.target.value)} />
                                <ErrorMsg field="name" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Hôte / IP</label>
                                <input className={`w-full rounded-xl border-slate-200 focus:ring-indigo-500 ${errors.host && touched.host ? 'border-red-500 bg-red-50' : ''}`}
                                    placeholder="10.x.x.x ou ftp.domaine.com" value={data.host}
                                    onChange={e => handleChange("host", e.target.value)} />
                                <ErrorMsg field="host" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Port</label>
                                <input type="number" className={`w-full rounded-xl border-slate-200 focus:ring-indigo-500 ${errors.port && touched.port ? 'border-red-500 bg-red-50' : ''}`}
                                    value={data.port} onChange={e => handleChange("port", e.target.value)} />
                                <ErrorMsg field="port" />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Utilisateur</label>
                                <input className={`w-full rounded-xl border-slate-200 focus:ring-indigo-500 ${errors.username && touched.username ? 'border-red-500 bg-red-50' : ''}`}
                                    value={data.username} onChange={e => handleChange("username", e.target.value)} />
                                <ErrorMsg field="username" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
                                <input type="password" 
                                    className={`w-full rounded-xl border-slate-200 focus:ring-indigo-500 ${errors.password && touched.password ? 'border-red-500 bg-red-50' : ''}`}
                                    value={data.password} onChange={e => handleChange("password", e.target.value)} 
                                    placeholder={editing ? "Laisser vide pour conserver l'ancien" : "Obligatoire"} />
                                <ErrorMsg field="password" />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                            <button type="button" onClick={handleTestConnection}
                                disabled={testStatus === 'loading' || processing || pendingSubmit}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all">
                                <ArrowsRightLeftIcon className={`w-5 h-5 ${testStatus === 'loading' ? 'animate-spin' : ''}`} />
                                Tester la connexion
                            </button>

                            <div className="flex gap-3">
                                {editing && (
                                    <button type="button" onClick={() => { setEditing(null); reset(); setTouched({}); clearErrors(); }}
                                        className="px-6 py-2.5 rounded-xl text-slate-500 font-semibold hover:bg-slate-100">
                                        Annuler
                                    </button>
                                )}
                                <button type="submit" disabled={processing || pendingSubmit}
                                    className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50">
                                    {editing ? "Enregistrer les modifications" : "Créer le serveur"}
                                </button>
                            </div>
                        </div>
                        
                        {testStatus === 'success' && (
                            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm flex items-center gap-2 border border-green-200">
                                <CheckCircleIcon className="w-5 h-5"/> Connexion réussie !
                            </div>
                        )}
                        {testStatus === 'error' && (
                            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2 border border-red-200">
                                <ExclamationCircleIcon className="w-5 h-5"/> Échec de connexion. Vérifiez vos identifiants.
                            </div>
                        )}
                    </form>
                </div>

                {/* LISTE DES SERVEURS */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                                        
                                        <button onClick={() => handleDelete(ftp)}
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

            {/* Modals */}
            <DeleteConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setFtpToDelete(null);
                }}
                onConfirm={confirmDelete}
                ftp={ftpToDelete}
            />

            <ActionConfirmModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setPendingSubmit(false);
                }}
                onConfirm={confirmSubmit}
                action={editing ? 'update' : 'create'}
                ftp={data}
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    setSuccessAction('');
                }}
                action={successAction}
            />
        </AuthenticatedLayout>
    );
}