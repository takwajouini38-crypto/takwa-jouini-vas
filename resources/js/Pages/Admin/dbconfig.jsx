import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    CircleStackIcon, ServerIcon, CheckCircleIcon, 
    ExclamationTriangleIcon, ArrowPathIcon, ShieldCheckIcon,
    PencilSquareIcon, TrashIcon, KeyIcon, PlusCircleIcon,
    XMarkIcon, InformationCircleIcon
} from "@heroicons/react/24/outline";
import axios from 'axios';

// Composant Modal de confirmation de suppression
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, config }) => {
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
                        <h3 className="text-lg font-bold text-gray-900">Supprimer la configuration</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-4">
                        Êtes-vous sûr de vouloir supprimer cette configuration Oracle ?
                    </p>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <ServerIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Hôte :</span>
                                <span className="font-mono text-gray-900 font-bold">{config?.host}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CircleStackIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">SID :</span>
                                <span className="font-mono text-gray-900 font-bold">{config?.service_name}</span>
                            </div>
                            {config?.port && (
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-600 font-medium">Port :</span>
                                    <span className="font-mono text-gray-900">{config.port}</span>
                                </div>
                            )}
                            {config?.username && (
                                <div className="flex items-center gap-3 text-sm">
                                    <KeyIcon className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600 font-medium">Utilisateur :</span>
                                    <span className="font-mono text-gray-900">{config.username}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-red-700">
                            <p className="font-bold mb-1">⚠️ Action irréversible</p>
                            <p>Toutes les données associées à cette configuration seront définitivement supprimées.</p>
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

// Composant Modal de confirmation pour Enregistrement/Mise à jour
const ActionConfirmModal = ({ isOpen, onClose, onConfirm, action, config }) => {
    if (!isOpen) return null;

    const isUpdate = action === 'update';
    const title = isUpdate ? "Modifier la configuration" : "Nouvelle configuration";
    const icon = isUpdate ? PencilSquareIcon : PlusCircleIcon;
    const confirmText = isUpdate ? "Mettre à jour" : "Enregistrer";
    const confirmColor = isUpdate ? "bg-indigo-500 hover:bg-indigo-600" : "bg-orange-600 hover:bg-orange-700";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isUpdate ? 'bg-indigo-50' : 'bg-orange-50'}`}>
                            {React.createElement(icon, { className: `w-5 h-5 ${isUpdate ? 'text-indigo-500' : 'text-orange-500'}` })}
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
                            ? "Êtes-vous sûr de vouloir modifier cette configuration Oracle ?"
                            : "Êtes-vous sûr de vouloir créer une nouvelle configuration Oracle ?"
                        }
                    </p>
                    
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <ServerIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Hôte :</span>
                                <span className="font-mono text-gray-900 font-bold">{config?.host || config?.host}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-600 font-medium">Port :</span>
                                <span className="font-mono text-gray-900">{config?.port || 1521}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <CircleStackIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">SID :</span>
                                <span className="font-mono text-gray-900 font-bold">{config?.service_name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <KeyIcon className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 font-medium">Utilisateur :</span>
                                <span className="font-mono text-gray-900">{config?.username}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`flex items-start gap-3 p-3 rounded-xl border ${isUpdate ? 'bg-indigo-50 border-indigo-100' : 'bg-blue-50 border-blue-100'}`}>
                        <InformationCircleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isUpdate ? 'text-indigo-500' : 'text-blue-500'}`} />
                        <div className={`text-xs ${isUpdate ? 'text-indigo-700' : 'text-blue-700'}`}>
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

// Composant Modal de succès
const SuccessModal = ({ isOpen, onClose, message, action }) => {
    if (!isOpen) return null;

    const getActionText = () => {
        switch(action) {
            case 'create': return 'créée';
            case 'update': return 'modifiée';
            case 'delete': return 'supprimée';
            default: return 'effectuée';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-in zoom-in duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Succès !</h3>
                    <p className="text-gray-600 mb-6">
                        La configuration a été {getActionText()} avec succès.
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

export default function DbConfig({ configs = [], auth }) {
    const [testStatus, setTestStatus] = useState(null);
    const [testMessage, setTestMessage] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [touched, setTouched] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [configToDelete, setConfigToDelete] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successAction, setSuccessAction] = useState('');
    const [pendingSubmit, setPendingSubmit] = useState(false);

    const { data, setData, post, put, processing, errors, setError, reset, clearErrors } = useForm({
        id: null,
        host: '',
        port: 1521,
        service_name: '',
        username: '',
        password: '',
        is_active: false,
    });

    // --- LOGIQUE DE VALIDATION STRICTE ---
    useEffect(() => {
        if (touched.host) {
            const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
            if (!data.host) setError('host', "L'adresse IP est requise.");
            else if (!ipRegex.test(data.host)) setError('host', "Format IP invalide (ex: 192.168.1.10).");
            else clearErrors('host');
        }

        if (touched.port) {
            const portNum = parseInt(data.port);
            if (!data.port) {
                setError('port', "Le port est requis.");
            } else if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
                setError('port', "Le port doit être compris entre 1 et 65535.");
            } else {
                clearErrors('port');
            }
        }

        if (touched.service_name && !data.service_name) {
            setError('service_name', "Le SID est requis.");
        } else if (touched.service_name) {
            clearErrors('service_name');
        }

        if (touched.username && !data.username) {
            setError('username', "L'utilisateur est requis.");
        } else if (touched.username) {
            clearErrors('username');
        }

        if (touched.password) {
            if (!editMode && !data.password) {
                setError('password', "Le mot de passe est obligatoire pour une nouvelle config.");
            } else if (data.password && data.password.length < 3) {
                setError('password', "Mot de passe trop court.");
            } else {
                clearErrors('password');
            }
        }
    }, [data, touched, editMode]);

    const handleChange = (field, value) => {
        setData(field, value);
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleEdit = (config) => {
        clearErrors();
        setTouched({});
        setEditMode(true);
        setTestStatus(null);
        setData({
            id: config.id,
            host: config.host || '',
            port: config.port || 1521,
            service_name: config.service_name || '',
            username: config.username || '',
            password: '', 
            is_active: config.is_active === 1 || config.is_active === true,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTest = async () => {
        if (errors.port) return;

        setTestStatus('loading');
        setTestMessage("");
        try {
            const response = await axios.post(route('admin.db.test'), data);
            if (response.data.success) setTestStatus('success');
            else {
                setTestStatus('error');
                setTestMessage(response.data.message || "Échec du test.");
            }
        } catch (error) {
            setTestStatus('error');
            setTestMessage("Erreur réseau : Serveur Oracle injoignable.");
        }
    };

    const validateForm = () => {
        const fields = { host: true, port: true, service_name: true, username: true, password: true };
        setTouched(fields);

        const portNum = parseInt(data.port);
        if (!data.host || isNaN(portNum) || portNum < 1 || portNum > 65535 || !data.service_name || !data.username || (!editMode && !data.password)) {
            return false;
        }
        return true;
    };

    const handleSubmitRequest = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setPendingSubmit(true);
        setShowConfirmModal(true);
    };

    const confirmSubmit = () => {
        setShowConfirmModal(false);
        
        if (editMode) {
            router.post(route('admin.db.update', { id: data.id }), {
                ...data, _method: 'put', 
            }, {
                onSuccess: () => {
                    setEditMode(false);
                    reset();
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
            post(route('admin.db.store'), {
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

    const handleDelete = (config) => {
        setConfigToDelete(config);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (configToDelete) {
            router.post(route('admin.db.destroy', { id: configToDelete.id }), { 
                _method: "delete" 
            }, {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setConfigToDelete(null);
                    setSuccessAction('delete');
                    setShowSuccessModal(true);
                }
            });
        }
    };

    const handleActivate = (id) => {
        router.post(route('admin.db.active', id), {}, { preserveScroll: true });
    };

    const ErrorMsg = ({ field }) => (
        errors[field] && touched[field] ? <p className="text-red-600 text-[11px] mt-1 font-bold animate-pulse">⚠️ {errors[field]}</p> : null
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Configuration Oracle" />
            <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
                
                <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <ServerIcon className="w-8 h-8 text-orange-600" />
                            <h2 className="text-xl font-extrabold text-slate-800 uppercase tracking-tight">
                                {editMode ? "Modifier la connexion" : "Nouvelle connexion Oracle"}
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitRequest} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Hôte (IP)</label>
                                    <input type="text" className={`w-full rounded-2xl border-slate-200 focus:ring-orange-500 ${errors.host && touched.host ? 'border-red-500 bg-red-50' : ''}`} value={data.host} onChange={e => handleChange('host', e.target.value)} placeholder="ex: 10.0.0.1" />
                                    <ErrorMsg field="host" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Port (1-65535)</label>
                                        <input type="number" min="1" max="65535" className={`w-full rounded-2xl border-slate-200 focus:ring-orange-500 ${errors.port && touched.port ? 'border-red-500 bg-red-50' : ''}`} value={data.port} onChange={e => handleChange('port', e.target.value)} />
                                        <ErrorMsg field="port" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">SID</label>
                                        <input type="text" className={`w-full rounded-2xl border-slate-200 focus:ring-orange-500 ${errors.service_name && touched.service_name ? 'border-red-500 bg-red-50' : ''}`} value={data.service_name} onChange={e => handleChange('service_name', e.target.value)} />
                                        <ErrorMsg field="service_name" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Utilisateur</label>
                                    <input type="text" className={`w-full rounded-2xl border-slate-200 focus:ring-orange-500 ${errors.username && touched.username ? 'border-red-500 bg-red-50' : ''}`} value={data.username} onChange={e => handleChange('username', e.target.value)} />
                                    <ErrorMsg field="username" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
                                    <input type="password" className={`w-full rounded-2xl border-slate-200 focus:ring-orange-500 ${errors.password && touched.password ? 'border-red-500 bg-red-50' : ''}`} value={data.password} onChange={e => handleChange('password', e.target.value)} placeholder={editMode ? "Laisser vide pour garder l'ancien" : "Obligatoire"} />
                                    <ErrorMsg field="password" />
                                </div>
                            </div>
                        </div>

                        {testStatus && testStatus !== 'loading' && (
                            <div className={`mt-8 p-4 rounded-2xl flex items-center gap-4 ${testStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                {testStatus === 'success' ? <CheckCircleIcon className="w-6 h-6" /> : <ExclamationTriangleIcon className="w-6 h-6" />}
                                <span className="font-bold">{testStatus === 'success' ? "Connexion OK !" : testMessage}</span>
                            </div>
                        )}

                        <div className="mt-10 pt-8 border-t flex flex-col md:flex-row justify-between gap-4">
                            <button type="button" onClick={handleTest} disabled={testStatus === 'loading' || processing || pendingSubmit} className="px-8 py-3 border-2 border-slate-200 rounded-2xl font-black text-slate-600 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all">
                                <ArrowPathIcon className={`w-5 h-5 ${testStatus === 'loading' ? 'animate-spin' : ''}`} />
                                TESTER LA CONNEXION
                            </button>
                            <button type="submit" disabled={processing || pendingSubmit} className="px-12 py-3 bg-orange-600 text-white rounded-2xl font-black shadow-xl hover:bg-orange-700 transition-all uppercase tracking-wider">
                                {editMode ? "Mettre à jour" : "Enregistrer"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* TABLEAU */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b bg-slate-50 flex items-center gap-3">
                        <CircleStackIcon className="w-6 h-6 text-indigo-500" />
                        <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Connexions Actives</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="p-6">Destination</th>
                                    <th className="p-6">SID</th>
                                    <th className="p-6">Utilisateur</th>
                                    <th className="p-6 text-center">État</th>
                                    <th className="p-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {configs.map((config) => (
                                    <tr key={config.id} className="hover:bg-slate-50 transition-all">
                                        <td className="p-6">
                                            <div className="font-bold text-slate-700">{config.host}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">PORT: {config.port}</div>
                                        </td>
                                        <td className="p-6 text-slate-600 font-mono text-sm">{config.service_name}</td>
                                        <td className="p-6">
                                            <span className="flex items-center gap-2 text-slate-700 font-semibold">
                                                <KeyIcon className="w-4 h-4 text-slate-400" />
                                                {config.username}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            {config.is_active ? 
                                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black">ACTIF</span> : 
                                                <span className="text-slate-300 text-[10px] font-bold">INACTIF</span>
                                            }
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            {!config.is_active && (
                                                <button onClick={() => handleActivate(config.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                    <ShieldCheckIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(config)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleDelete(config)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <DeleteConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setConfigToDelete(null);
                }}
                onConfirm={confirmDelete}
                config={configToDelete}
            />

            <ActionConfirmModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setPendingSubmit(false);
                }}
                onConfirm={confirmSubmit}
                action={editMode ? 'update' : 'create'}
                config={data}
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