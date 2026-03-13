import React, { useEffect, useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Bar, Line, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// ... ton composant

OperationalDashboard.layout = page => <AuthenticatedLayout title={page.props.title} children={page} />;

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Animation personnalisée (à ajouter dans votre fichier CSS global ou via un style tag)
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }
    .delay-500 { animation-delay: 0.5s; }
`;
document.head.appendChild(style);

export default function OperationalDashboard() {
    const { chartData = [], pieData = [], filters = {}, kpis = {} } = usePage().props;
    const [counters, setCounters] = useState({ total: 0, average: 0, max: 0, min: 0, variation: 0 });

    // Animation des compteurs KPI
    useEffect(() => {
        if (kpis.total) {
            const duration = 1000;
            const steps = 60;
            const interval = duration / steps;
            let step = 0;
            const timer = setInterval(() => {
                step++;
                setCounters({
                    total: Math.round((kpis.total * step) / steps),
                    average: Math.round((kpis.average * step) / steps),
                    max: Math.round((kpis.max * step) / steps),
                    min: Math.round((kpis.min * step) / steps),
                    variation: parseFloat(((kpis.variation * step) / steps).toFixed(2))
                });
                if (step >= steps) clearInterval(timer);
            }, interval);
            return () => clearInterval(timer);
        }
    }, [kpis]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        router.get('/mmg-traffic', {
            ...filters,
            [name]: value,
            day: name === 'period' && value === 'day' ? null : filters.day
        }, { preserveState: true, replace: true });
    };

    const setPeriod = (period) => {
        router.get('/mmg-traffic', {
            ...filters,
            period,
            day: period === 'day' ? null : filters.day
        }, { preserveState: true, replace: true });
    };

    const labels = chartData.map(item => item.label);
    const values = chartData.map(item => item.total);

    // Configuration des graphiques
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(203, 213, 225, 0.3)' },
                ticks: {
                    callback: (value) => value + 'k',
                    color: '#64748b'
                }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
            }
        },
        elements: {
            line: { tension: 0.4 }
        }
    };

    // Bar Chart avec dégradé et ombre
    const barData = {
        labels,
        datasets: [{
            label: filters.period === 'hour' ? "CDR par Heure" : "CDR par Jour",
            data: values,
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#8b5cf6');
                return gradient;
            },
            borderRadius: 12,
            barPercentage: 0.6,
            categoryPercentage: 0.8,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.1)'
        }]
    };

    // Line Chart avec remplissage dégradé
    const lineData = {
        labels,
        datasets: [{
            label: "Tendance CDR",
            data: values,
            borderColor: '#8b5cf6',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
                return gradient;
            },
            fill: true,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 8,
            borderWidth: 3
        }]
    };

    // Pie Chart (donut)
    const pieChartData = {
        labels: pieData.map(p => p.subscriber_type),
        datasets: [{
            data: pieData.map(p => p.total),
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 12, family: 'Inter, sans-serif' },
                    color: '#1e293b'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1'
            }
        },
        cutout: '65%',
        animation: { animateScale: true, animateRotate: true }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6 lg:p-8">
            {/* Éléments de fond décoratifs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* En-tête avec glassmorphisme */}
                <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 animate-fadeInUp">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                MMG Traffic Dashboard
                            </h1>
                            <p className="text-slate-500 mt-2 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Analyse en temps réel du trafic CDR
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-3">
                            {/* Sélecteur de période */}
                            <div className="flex rounded-xl bg-slate-100 p-1">
                                <button
                                    onClick={() => setPeriod('day')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        filters.period === 'day' || !filters.period
                                            ? 'bg-white text-blue-600 shadow-md'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Jour
                                </button>
                                <button
                                    onClick={() => setPeriod('hour')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                        filters.period === 'hour'
                                            ? 'bg-white text-blue-600 shadow-md'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Heure
                                </button>
                            </div>
                            {/* Filtre type abonné */}
                            <select
                                name="subscriber_type"
                                value={filters.subscriber_type || ''}
                                onChange={handleFilterChange}
                                className="bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
                            >
                                <option value="">Tous les abonnés</option>
                                <option value="PREPAID">Prépayé</option>
                                <option value="HYBRID">Hybride</option>
                                <option value="POSTPAID">Postpayé</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bouton retour */}
                {filters.period === 'hour' && filters.day && (
                    <div className="mb-6 animate-fadeInUp delay-100">
                        <button
                            className="inline-flex items-center px-5 py-2.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg text-sm font-medium text-slate-700 hover:bg-white transition-all group"
                            onClick={() => router.get('/mmg-traffic', { ...filters, period: 'day', day: null }, { preserveState: true })}
                        >
                            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Retour à la vue journalière
                        </button>
                    </div>
                )}

                {/* Cartes KPI glassmorphiques */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <KpiCard
                        title="Total CDR"
                        value={counters.total}
                        icon="total"
                        color="from-blue-500 to-blue-600"
                        delay="100"
                    />
                    <KpiCard
                        title="Moyenne"
                        value={counters.average}
                        icon="average"
                        color="from-green-500 to-green-600"
                        delay="200"
                    />
                    <KpiCard
                        title="Max"
                        value={counters.max}
                        icon="max"
                        color="from-orange-500 to-orange-600"
                        delay="300"
                    />
                    <KpiCard
                        title="Min"
                        value={counters.min}
                        icon="min"
                        color="from-purple-500 to-purple-600"
                        delay="400"
                    />
                    <KpiCard
                        title="Variation %"
                        value={`${counters.variation}%`}
                        icon="variation"
                        color={kpis.variation >= 0 ? "from-green-500 to-green-600" : "from-red-500 to-red-600"}
                        trend={kpis.variation >= 0 ? 'up' : 'down'}
                        delay="500"
                    />
                </div>

                {/* Graphiques */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Bar Chart */}
                    <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl p-6 border border-white/20 animate-fadeInUp delay-100">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <span className="inline-block w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
                            {filters.period === 'hour' ? "CDR par Heure" : "CDR par Jour"}
                        </h3>
                        <div className="h-64">
                            <Bar
                                data={barData}
                                options={{
                                    ...chartOptions,
                                    onClick: (event, elements) => {
                                        if (elements.length > 0 && filters.period === 'day') {
                                            const index = elements[0].index;
                                            const dayLabel = labels[index];
                                            router.get('/mmg-traffic', { ...filters, period: 'hour', day: dayLabel }, { preserveState: true, replace: true });
                                        }
                                    }
                                }}
                            />
                        </div>
                        {filters.period === 'day' && (
                            <p className="text-xs text-slate-400 mt-2 text-center">Cliquez sur une barre pour explorer les détails horaires</p>
                        )}
                    </div>

                    {/* Line Chart */}
                    <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl p-6 border border-white/20 animate-fadeInUp delay-200">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                            <span className="inline-block w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
                            Tendance CDR
                        </h3>
                        <div className="h-64">
                            <Line data={lineData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Pie Chart centré */}
                <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl p-6 border border-white/20 animate-fadeInUp delay-300">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">Répartition par type d'abonné</h3>
                    <div className="flex justify-center">
                        <div className="w-80 h-80">
                            <Pie data={pieChartData} options={pieOptions} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-right text-xs text-slate-400">
                    Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
                </div>
            </div>
        </div>
    );
}

// Composant KPI avec design glassmorphique et icônes
function KpiCard({ title, value, icon, color, trend, delay }) {
    const icons = {
        total: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        average: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        max: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
        ),
        min: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        ),
        variation: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
        )
    };

    const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';

    return (
        <div className={`backdrop-blur-xl bg-white/70 rounded-2xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all transform hover:-translate-y-1 animate-fadeInUp delay-${delay}`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                    {icons[icon]}
                </div>
                {trend && (
                    <span className={`text-2xl font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {trendIcon}
                    </span>
                )}
            </div>
            <h4 className="text-sm text-slate-500 uppercase tracking-wider">{title}</h4>
            <p className={`text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {value}
            </p>
        </div>
    );
}