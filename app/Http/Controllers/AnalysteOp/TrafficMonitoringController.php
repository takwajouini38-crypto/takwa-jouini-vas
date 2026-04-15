<?php

namespace App\Http\Controllers\AnalysteOp;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class TrafficMonitoringController extends Controller
{
    public function index(Request $request)
    {
        $startInput = $request->input('start_date');
        $endInput = $request->input('end_date');

        // 1. Définition des dates par défaut basées sur la date MAX en base
        $range = DB::table('ra_t_occ_agg')->select(DB::raw("MAX(START_DATE) as max_d"))->first();
        $maxDateInDb = $range->max_d ? Carbon::parse($range->max_d) : Carbon::now();

        if (!$startInput || !$endInput) {
            // Par défaut : le mois complet précédant la date max
            $startDate = $maxDateInDb->copy()->startOfMonth();
            $endDate = $maxDateInDb->copy();
        } else {
            // Nettoyage format 0025 -> 2025 si nécessaire
            if (str_starts_with($startInput, '00')) $startInput = '20' . substr($startInput, 2);
            if (str_starts_with($endInput, '00')) $endInput = '20' . substr($endInput, 2);
            
            $startDate = Carbon::parse($startInput)->startOfDay();
            $endDate = Carbon::parse($endInput)->endOfDay();
        }

        // 2. VÉRIFICATION : Est-ce que les dates sélectionnées existent en base ?
        $startExists = DB::table('ra_t_occ_agg')
            ->whereRaw("TRUNC(START_DATE) = TO_DATE(?, 'YYYY-MM-DD')", [$startDate->toDateString()])
            ->exists();
            
        $endExists = DB::table('ra_t_occ_agg')
            ->whereRaw("TRUNC(START_DATE) = TO_DATE(?, 'YYYY-MM-DD')", [$endDate->toDateString()])
            ->exists();

        // 3. Initialisation des variables
        $formattedData = collect([]);
        $stats = [
            'total_mmg' => 0, 'total_occ' => 0, 'avg_deviation' => 0, 'alert_days' => 0,
        ];

        // 4. Si les dates sont valides, on récupère le traffic
        if ($startExists && $endExists) {
            $mmgSub = DB::table('ra_t_mmg_agg')
                ->select(DB::raw("TRUNC(START_DATE) as day_date"), DB::raw("SUM(CDR_COUNT) as total_mmg"))
                ->whereBetween('START_DATE', [$startDate, $endDate])
                ->groupBy(DB::raw("TRUNC(START_DATE)"));

            $trafficData = DB::table('ra_t_occ_agg as o')
                ->select(
                    DB::raw("TRUNC(o.START_DATE) as date_brute"),
                    DB::raw("NVL(mmg.total_mmg, 0) as mmg_count"),
                    DB::raw("SUM(o.CDR_COUNT) as occ_count")
                )
                ->leftJoinSub($mmgSub, 'mmg', function ($join) {
                    $join->on(DB::raw("TRUNC(o.START_DATE)"), '=', 'mmg.day_date');
                })
                ->whereBetween('o.START_DATE', [$startDate, $endDate])
                ->groupBy(DB::raw("TRUNC(o.START_DATE)"), 'mmg.total_mmg')
                ->orderBy(DB::raw("TRUNC(o.START_DATE)"), 'asc')
                ->get();

            $formattedData = $trafficData->map(function ($item) {
                $item->date = Carbon::parse($item->date_brute)->format('d/m/Y');
                $mmg = (float)$item->mmg_count;
                $occ = (float)$item->occ_count;
                $maxVal = max($mmg, $occ);
                $item->deviation = $maxVal > 0 ? round((abs($mmg - $occ) / $maxVal) * 100, 2) : 0;
                return $item;
            });

            $stats = [
                'total_mmg' => $formattedData->sum('mmg_count'),
                'total_occ' => $formattedData->sum('occ_count'),
                'avg_deviation' => $formattedData->count() > 0 ? round($formattedData->avg('deviation'), 2) : 0,
                'alert_days' => $formattedData->where('deviation', '>', 5)->count(),
            ];
        }

        return Inertia::render('AnalysteOp/TrafficDashboard', [
            'data'    => $formattedData,
            'stats'   => $stats,
            'filters' => [
                'start_date' => $startDate->toDateString(), 
                'end_date'   => $endDate->toDateString()
            ]
        ]);
    }
}