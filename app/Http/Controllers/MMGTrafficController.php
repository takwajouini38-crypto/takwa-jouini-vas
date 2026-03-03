<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MMGTrafficController extends Controller
{
    public function index(Request $request)
    {
        $period = $request->get('period', 'day'); // 'day' ou 'hour'
        $subscriberType = $request->get('subscriber_type');
        $day = $request->get('day', null); // pour drill-down

        // Connexion Oracle
        $baseQuery = DB::connection('oracle')->table('ra_t_mmg_agg');

        if (!empty($subscriberType)) {
            $baseQuery->where('subscriber_type', $subscriberType);
        }

        // =========================
        // DATA PRINCIPALE
        // =========================
        if ($period === 'hour' && $day) {
            // drill-down sur un jour spécifique
            $data = (clone $baseQuery)
                ->select(
                    'start_date',
                    'start_hour',
                    DB::raw('SUM(cdr_count) as total_cdr')
                )
                ->where('start_date', $day)
                ->groupBy('start_date', 'start_hour')
                ->orderBy('start_hour')
                ->get();

            $chartData = $data->map(function ($item) {
                return [
                    'label' => str_pad($item->start_hour, 2, '0', STR_PAD_LEFT) . ':00',
                    'total' => (int) $item->total_cdr,
                ];
            });

        } else {
            // vue par jour
            $data = (clone $baseQuery)
                ->select(
                    'start_date',
                    DB::raw('SUM(cdr_count) as total_cdr')
                )
                ->groupBy('start_date')
                ->orderBy('start_date')
                ->get();

            $chartData = $data->map(function ($item) {
                return [
                    'label' => $item->start_date, // YYYY-MM-DD pour correspondance front
                    'total' => (int) $item->total_cdr,
                ];
            });
        }

        // =========================
        // KPI CALCULATIONS
        // =========================
        $totals = collect($chartData)->pluck('total');

        $totalCDR = $totals->sum() ?? 0;
        $avgCDR   = $totals->avg() ?? 0;
        $maxCDR   = $totals->max() ?? 0;
        $minCDR   = $totals->min() ?? 0;

        $last = $totals->last() ?? 0;
        $previous = $totals->count() > 1 ? $totals[$totals->count() - 2] : 0;
        $variation = $previous > 0 ? round((($last - $previous) / $previous) * 100, 2) : 0;

        // =========================
        // PIE DATA (filtré si drill-down)
        // =========================
        $pieQuery = (clone $baseQuery);
        if ($period === 'hour' && $day) {
            $pieQuery->where('start_date', $day);
        }

        $pieData = $pieQuery
            ->select('subscriber_type', DB::raw('SUM(cdr_count) as total'))
            ->groupBy('subscriber_type')
            ->get()
            ->map(function ($item) {
                return [
                    'subscriber_type' => $item->subscriber_type,
                    'total' => (int) $item->total,
                ];
            });

        // =========================
        // Retour vers Inertia
        // =========================
        return Inertia::render('Dashboards/Index', [
            'title' => 'Dashboard Opérationnel',
            'chartData' => $chartData->values()->toArray(),
            'pieData'   => $pieData->values()->toArray(),
            'filters'   => [
                'period' => $period,
                'subscriber_type' => $subscriberType,
                'day' => $day,
            ],
            'kpis' => [
                'total' => $totalCDR,
                'average' => round($avgCDR),
                'max' => $maxCDR,
                'min' => $minCDR,
                'variation' => $variation,
            ],
        ]);
    }
}