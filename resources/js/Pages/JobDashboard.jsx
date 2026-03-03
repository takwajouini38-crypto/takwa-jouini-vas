import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PlayIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
export default function JobDashboard({ jobs: initialJobs }) {
    const [jobs, setJobs] = useState(initialJobs || []);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Rafraîchissement manuel
    const refreshJobs = () => {
        setRefreshing(true);
        router.get(route('job-tasks.dashboard'), {}, {
            preserveState: true,
            replace: true,
            onSuccess: (page) => {
                setJobs(page.props.jobs);
                setRefreshing(false);
            },
            onError: () => setRefreshing(false)
        });
    };

    // Polling toutes les 10 secondes
    useEffect(() => {
        const interval = setInterval(() => {
            router.get(route('job-tasks.dashboard'), {}, {
                preserveState: true,
                replace: true,
                onSuccess: (page) => setJobs(page.props.jobs)
            });
        }, 10000);
        return () => clearInterval(interval);
    }, []);





const handleStart = async (jobId) => {
    if (!confirm('Démarrer le job ?')) return;
    setLoading(true);
    try {
        await axios.post(route('job-tasks.start', jobId));
        // Mise à jour optimiste
        setJobs(prev =>
            prev.map(job => job.id === jobId ? { ...job, status: 'running' } : job)
        );
    } catch (error) {
        console.error('Erreur démarrage:', error);
        alert('Erreur lors du démarrage du job');
    } finally {
        setLoading(false);
    }
};

const handleStop = async (jobId) => {
    if (!confirm('Arrêter le job ?')) return;
    setLoading(true);
    try {
        await axios.post(route('job-tasks.stop', jobId));
        setJobs(prev =>
            prev.map(job => job.id === jobId ? { ...job, status: 'stopped' } : job)
        );
    } catch (error) {
        console.error('Erreur arrêt:', error);
        alert('Erreur lors de l\'arrêt du job');
    } finally {
        setLoading(false);
    }
};
    const getStatusBadge = (status) => {
        const config = {
            running: { bg: 'bg-green-100', text: 'text-green-800', label: 'En cours', icon: '🟢' },
            stopped: { bg: 'bg-red-100', text: 'text-red-800', label: 'Arrêté', icon: '🔴' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente', icon: '🟡' },
            failed:  { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Échec', icon: '⚫' }
        };
        const { bg, text, label, icon } = config[status] || config.stopped;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${bg} ${text}`}>
                <span className="mr-1">{icon}</span>
                {label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                {/* En-tête avec titre et bouton rafraîchir */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">Suivi des jobs</h2>
                    <button
                        onClick={refreshJobs}
                        disabled={refreshing}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <ArrowPathIcon className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
                    </button>
                </div>

                {/* Carte principale avec effet de verre */}
                <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <span className="inline-block w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                            Liste des jobs
                        </h3>

                        {jobs.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Aucun job trouvé</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white/50 divide-y divide-gray-200">
                                        {jobs.map((job, index) => (
                                            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{job.type}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(job.status)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {job.status !== 'running' ? (
                                                        <button
                                                            onClick={() => handleStart(job.id)}
                                                            disabled={loading}
                                                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            <PlayIcon className="w-4 h-4 mr-1" />
                                                            Démarrer
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStop(job.id)}
                                                            disabled={loading}
                                                            className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                        >
                                                            <StopIcon className="w-4 h-4 mr-1" />
                                                            Arrêter
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Appliquer le layout
JobDashboard.layout = page => <AuthenticatedLayout title={page.props.title} children={page} />;