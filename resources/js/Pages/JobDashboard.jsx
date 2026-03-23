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
    ServerIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

// 🔹 Stat Card
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

    // 🔹 Stats
    const stats = {
        total: jobs.length,
        running: jobs.filter(j => j.status === 'running').length,
        failed: jobs.filter(j => j.status === 'failed').length,
    };

    // 🔹 Refresh depuis Laravel (source de vérité)
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

    // 🔥 Auto refresh toutes les 3 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            refreshJobs(false);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // 🔹 START (corrigé)
    const handleStart = async (jobId) => {
        if (!confirm('Démarrer ce processus ?')) return;

        setLoadingId(jobId);

        try {
            await axios.post(route('job-tasks.start', jobId));

            // 🔥 IMPORTANT : resynchronisation avec backend
            refreshJobs(false);

        } catch (error) {
            console.error(error);
            alert('Erreur lors du démarrage.');
        } finally {
            setLoadingId(null);
        }
    };

    // 🔹 STOP (corrigé)
    const handleStop = async (jobId) => {
        if (!confirm('Arrêter ce processus ?')) return;

        setLoadingId(jobId);

        try {
            await axios.post(route('job-tasks.stop', jobId));

            // 🔥 IMPORTANT : resynchronisation avec backend
            refreshJobs(false);

        } catch (error) {
            console.error(error);
            alert('Erreur lors de l\'arrêt.');
        } finally {
            setLoadingId(null);
        }
    };

    // 🔹 Badge statut
    const getStatusBadge = (status) => {
        const config = {
            running: { 
                styles: "bg-green-500 text-white animate-pulse", 
                label: "EN COURS", 
                icon: <ArrowPathIcon className="w-4 h-4 animate-spin" /> 
            },
            stopped: { 
                styles: "bg-red-100 text-red-800", 
                label: "ARRÊTÉ", 
                icon: <StopIcon className="w-4 h-4" /> 
            },
            failed: { 
                styles: "bg-red-600 text-white", 
                label: "ÉCHEC", 
                icon: <ExclamationTriangleIcon className="w-4 h-4" /> 
            },
            success: { 
                styles: "bg-green-100 text-green-800", 
                label: "TERMINÉ", 
                icon: <CheckCircleIcon className="w-4 h-4" /> 
            },
            pending: { 
                styles: "bg-sky-100 text-sky-800", 
                label: "EN ATTENTE", 
                icon: <CommandLineIcon className="w-4 h-4" /> 
            }
        };

        const { styles, label, icon } = config[status] || config.stopped;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles}`}>
                {icon}
                {label}
            </span>
        );
    };

    return (
        <div className="py-8 px-4 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ServerIcon className="w-8 h-8 text-sky-600" />
                        Monitoring CDR RA
                    </h1>

                    <button
                        onClick={() => refreshJobs(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg"
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Actualisation...' : 'Actualiser'}
                    </button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total" value={stats.total} icon={<CommandLineIcon className="w-6 h-6" />} color="sky" />
                    <StatCard title="Running" value={stats.running} icon={<ArrowPathIcon className="w-6 h-6" />} color="green" />
                    <StatCard title="Failed" value={stats.failed} icon={<ExclamationTriangleIcon className="w-6 h-6" />} color="red" />
                </div>

                {/* TABLE */}
                <table className="w-full bg-white rounded-xl shadow">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-4">Nom</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Statut</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {jobs.map(job => (
                            <tr key={job.id} className="border-t">
                                <td className="p-4">{job.name}</td>
                                <td className="p-4">{job.type}</td>
                                <td className="p-4">{getStatusBadge(job.status)}</td>
                                <td className="p-4">{job.updated_at}</td>

                                <td className="p-4 text-right">
                                    {job.status === 'running' ? (
                                        <button
                                            onClick={() => handleStop(job.id)}
                                            disabled={loadingId === job.id}
                                            className="px-3 py-1 bg-red-600 text-white rounded"
                                        >
                                            {loadingId === job.id ? '...' : 'Stop'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStart(job.id)}
                                            disabled={loadingId === job.id}
                                            className="px-3 py-1 bg-green-600 text-white rounded"
                                        >
                                            {loadingId === job.id ? '...' : 'Start'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {jobs.length === 0 && (
                    <div className="text-center mt-6">Aucun job</div>
                )}
            </div>
        </div>
    );
}

// 🔹 Layout
JobDashboard.layout = page => (
    <AuthenticatedLayout user={page.props.auth.user}>
        {page}
    </AuthenticatedLayout>
);