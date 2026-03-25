import React, { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    PlayIcon, 
    StopIcon, 
    ArrowPathIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    CommandLineIcon,
    ServerIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// --- NOUVEAU COMPOSANT MODAL ---
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) {
    if (!isOpen) return null;

    const isDanger = type === 'danger';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${isDanger ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {isDanger ? <ExclamationTriangleIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                        >
                            Annuler
                        </button>
                        <button 
                            onClick={onConfirm}
                            className={`px-6 py-2 text-white rounded-xl font-medium transition-colors ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- STAT CARD ---
function StatCard({ title, value, icon, color }) {
    const colors = {
        sky: "text-sky-700 bg-sky-100 border-sky-200",
        green: "text-green-700 bg-green-100 border-green-200",
        red: "text-red-700 bg-red-100 border-red-200"
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]} shadow-sm flex items-center gap-4`}>
            <div className="p-3 rounded-xl bg-white/80">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        </div>
    );
}

export default function JobDashboard({ jobs: initialJobs }) {
    const { auth } = usePage().props;
    const [jobs, setJobs] = useState(initialJobs || []);
    const [loadingId, setLoadingId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // --- ÉTATS POUR LA MODAL ---
    const [modalConfig, setModalConfig] = useState({ 
        isOpen: false, 
        type: 'success', 
        title: '', 
        message: '', 
        onConfirm: () => {} 
    });

    const stats = {
        total: jobs.length,
        running: jobs.filter(j => j.status === 'running').length,
        failed: jobs.filter(j => j.status === 'failed').length,
    };

    const refreshJobs = (showLoading = false) => {
        if (showLoading) setRefreshing(true);
        router.get(route('job-tasks.dashboard'), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setJobs(page.props.jobs);
                setRefreshing(false);
            },
            onError: () => setRefreshing(false)
        });
    };

    useEffect(() => {
        const interval = setInterval(() => refreshJobs(false), 3000);
        return () => clearInterval(interval);
    }, []);

    // 🔹 START (mis à jour avec Modal)
    const handleStart = (job) => {
        setModalConfig({
            isOpen: true,
            type: 'success',
            title: 'Démarrer le job',
            message: `Voulez-vous lancer le processus "${job.name}" ?`,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                setLoadingId(job.id);
                try {
                    await axios.post(route('job-tasks.start', job.id));
                    refreshJobs(false);
                } catch (error) {
                    alert('Erreur lors du démarrage.');
                } finally {
                    setLoadingId(null);
                }
            }
        });
    };

    // 🔹 STOP (mis à jour avec Modal)
    const handleStop = (job) => {
        setModalConfig({
            isOpen: true,
            type: 'danger',
            title: 'Arrêter le job',
            message: `Attention, vous allez arrêter le processus "${job.name}". Confirmer ?`,
            onConfirm: async () => {
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                setLoadingId(job.id);
                try {
                    await axios.post(route('job-tasks.stop', job.id));
                    refreshJobs(false);
                } catch (error) {
                    alert('Erreur lors de l\'arrêt.');
                } finally {
                    setLoadingId(null);
                }
            }
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            running: { styles: "bg-green-500 text-white animate-pulse", label: "EN COURS", icon: <ArrowPathIcon className="w-4 h-4 animate-spin" /> },
            stopped: { styles: "bg-red-100 text-red-800", label: "ARRÊTÉ", icon: <StopIcon className="w-4 h-4" /> },
            failed: { styles: "bg-red-600 text-white", label: "ÉCHEC", icon: <ExclamationTriangleIcon className="w-4 h-4" /> },
            success: { styles: "bg-green-100 text-green-800", label: "TERMINÉ", icon: <CheckCircleIcon className="w-4 h-4" /> },
            pending: { styles: "bg-sky-100 text-sky-800", label: "EN ATTENTE", icon: <CommandLineIcon className="w-4 h-4" /> }
        };
        const { styles, label, icon } = config[status] || config.stopped;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles}`}>
                {icon} {label}
            </span>
        );
    };

    return (
        <div className="py-8 px-4 bg-slate-50 min-h-screen relative">
            
            {/* INJECTION DE LA MODAL */}
            <ConfirmModal 
                {...modalConfig} 
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
            />

            <div className="max-w-7xl mx-auto">
                {/* HEADER */}
                <div className="flex justify-between mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
                        <ServerIcon className="w-8 h-8 text-sky-600" />
                        Monitoring CDR RA
                    </h1>
                    <button
                        onClick={() => refreshJobs(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Jobs" value={stats.total} icon={<CommandLineIcon className="w-6 h-6" />} color="sky" />
                    <StatCard title="En cours" value={stats.running} icon={<ArrowPathIcon className="w-6 h-6" />} color="green" />
                    <StatCard title="Échecs" value={stats.failed} icon={<ExclamationTriangleIcon className="w-6 h-6" />} color="red" />
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                                <th className="p-4">Nom du processus</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Statut actuel</th>
                                <th className="p-4">Dernière mise à jour</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {jobs.map(job => (
                                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-700">{job.name}</td>
                                    <td className="p-4 text-gray-500 text-sm">{job.type}</td>
                                    <td className="p-4">{getStatusBadge(job.status)}</td>
                                    <td className="p-4 text-gray-400 text-xs">{job.updated_at}</td>
                                    <td className="p-4 text-right">
                                        {job.status === 'running' ? (
                                            <button
                                                onClick={() => handleStop(job)}
                                                disabled={loadingId === job.id}
                                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-semibold transition-all"
                                            >
                                                <StopIcon className="w-4 h-4" />
                                                {loadingId === job.id ? '...' : 'Arrêter'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleStart(job)}
                                                disabled={loadingId === job.id}
                                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg font-semibold transition-all"
                                            >
                                                <PlayIcon className="w-4 h-4" />
                                                {loadingId === job.id ? '...' : 'Démarrer'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {jobs.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl mt-4 border border-dashed border-gray-300">
                        <CommandLineIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500">Aucun job n'est configuré pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

JobDashboard.layout = page => (
    <AuthenticatedLayout user={page.props.auth.user}>
        {page}
    </AuthenticatedLayout>
);