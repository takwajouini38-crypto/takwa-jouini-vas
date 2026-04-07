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

        try {
            if ($startInput && $endInput) {
                $startDate = Carbon::parse($startInput)->startOfDay();
                $endDate = Carbon::parse($endInput)->endOfDay();
            } else {
                $lastDateInDb = DB::table('ra_t_mmg_agg')->max('START_DATE');
                if ($lastDateInDb) {
                    $endDate = Carbon::parse($lastDateInDb)->endOfDay();
                    $startDate = Carbon::parse($lastDateInDb)->subDays(10)->startOfDay();
                } else {
                    $startDate = Carbon::now()->subDays(7)->startOfDay();
                    $endDate = Carbon::now()->endOfDay();
                }
            }
        } catch (\Exception $e) {
            $startDate = Carbon::now()->subDays(7)->startOfDay();
            $endDate = Carbon::now()->endOfDay();
        }

        $mmgSub = DB::table('ra_t_mmg_agg')
            ->select('START_DATE', DB::raw('SUM(CDR_COUNT) as total_mmg'))
            ->whereBetween('START_DATE', [$startDate, $endDate])
            ->groupBy('START_DATE');

        $trafficData = DB::table('ra_t_occ_agg as o')
            ->select(
                'o.START_DATE as date',
                'mmg.total_mmg as mmg_count',
                DB::raw('SUM(o.CDR_COUNT) as occ_count')
            )
            ->joinSub($mmgSub, 'mmg', function ($join) {
                $join->on('o.START_DATE', '=', 'mmg.START_DATE');
            })
            ->whereBetween('o.START_DATE', [$startDate, $endDate])
            ->groupBy('o.START_DATE', 'mmg.total_mmg')
            ->orderBy('o.START_DATE', 'asc')
            ->get()
            ->map(function ($item) {
                $item->date = Carbon::parse($item->date)->format('d/m/Y');
                $maxVal = max($item->mmg_count, $item->occ_count);
                $item->deviation = $maxVal > 0 
                    ? round((abs($item->mmg_count - $item->occ_count) / $maxVal) * 100, 2) 
                    : 0;
                return $item;
            });

        $stats = [
            'total_mmg' => $trafficData->sum('mmg_count'),
            'total_occ' => $trafficData->sum('occ_count'),
            'avg_deviation' => round($trafficData->avg('deviation'), 2),
            'alert_days' => $trafficData->where('deviation', '>', 5)->count(),
        ];

        return Inertia::render('AnalysteOp/TrafficDashboard', [
            'data' => $trafficData,
            'stats' => $stats,
            'filters' => [
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d')
            ]
        ]);
    }
}