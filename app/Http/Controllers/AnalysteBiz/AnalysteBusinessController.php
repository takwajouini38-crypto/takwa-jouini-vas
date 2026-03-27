<?php

namespace App\Http\Controllers\AnalysteBiz;

use App\Http\Controllers\Controller;
use App\Models\ServiceSmsPlus;
use App\Models\RaTOccAgg;
use App\Models\RaTMmgAgg;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ServicesExport;
use Carbon\Carbon;

class AnalysteBusinessController extends Controller
{
    public function analytics(Request $request)
    {
        // 1. Détection des vraies bornes de données
        $range = RaTOccAgg::select(
            DB::raw("MIN(start_date) as min_d"),
            DB::raw("MAX(start_date) as max_d")
        )->first();

        $defaultEnd = $range->max_d ? Carbon::parse($range->max_d)->toDateString() : now()->toDateString();
        $defaultStart = $range->max_d ? Carbon::parse($range->max_d)->startOfMonth()->toDateString() : now()->startOfMonth()->toDateString();

        $startDate = $request->start_date ?? $defaultStart;
        $endDate = $request->end_date ?? $defaultEnd;

        $sumRevenueRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

        // 2. Revenus par Fournisseur
        $revenueByProvider = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
            ->select(
                'services_sms_plus.nom_fournisseur', 
                DB::raw($sumRevenueRaw . ' as "total"') 
            )
            ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
            ->groupBy('services_sms_plus.nom_fournisseur')
            ->orderBy(DB::raw($sumRevenueRaw), 'desc')
            ->get();

       // 3. Revenus par SERVICE (Structure identique à Fournisseur)
$revenueByService = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
    ->select(
        'services_sms_plus.nom_service', 
        DB::raw('SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\'))) as "total"')
    )
    ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
    ->groupBy('services_sms_plus.nom_service')
    ->orderBy(DB::raw('SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))'), 'desc')
    ->limit(8) // Limité à 8 pour que les noms verticaux soient lisibles
    ->get();

        // 4. Évolution par JOUR
        $revenueByDay = RaTOccAgg::whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
            ->select(
                DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD') as \"day\""), 
                DB::raw($sumRevenueRaw . ' as "total"')
            )
            ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"))
            ->orderBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"), 'asc')
            ->get();

        // 5. Revenus par MOIS
        $revenueByMonth = RaTOccAgg::select(
                DB::raw("TO_CHAR(start_date, 'YYYY-MM') as \"month\""), 
                DB::raw($sumRevenueRaw . ' as "total"')
            )
            ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM')"))
            ->orderBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM')"), 'asc')
            ->get();

        return Inertia::render('AnalysteBiz/Analytics', [
            'revenueByProvider' => $revenueByProvider,
            'revenueByService'  => $revenueByService,
            'revenueByDay'      => $revenueByDay,
            'revenueByMonth'    => $revenueByMonth,
            'startDate'         => $startDate,
            'endDate'           => $endDate
        ]);
    }

    // Garde vos autres fonctions intactes (topServicesPage, execSearch, exportExcel...)
    public function exportExcel(Request $request) {
        $startDate = $request->start_date ?? now()->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? now()->endOfMonth()->toDateString();
        return Excel::download(new ServicesExport($startDate, $endDate), 'services_tt.xlsx');
    }
    // À ajouter dans AnalysteBusinessController.php

// Dans AnalysteBusinessController.php
public function dashboard(Request $request)
{
    // 1. Détection des dates dans Oracle
    $range = RaTOccAgg::select(
        DB::raw("MIN(start_date) as min_d"),
        DB::raw("MAX(start_date) as max_d")
    )->first();

    $startDate = $request->start_date ?? ($range->max_d ? \Carbon\Carbon::parse($range->max_d)->startOfMonth()->toDateString() : now()->startOfMonth()->toDateString());
    $endDate = $request->end_date ?? ($range->max_d ? \Carbon\Carbon::parse($range->max_d)->toDateString() : now()->toDateString());

    $sumRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

    // 2. Définition de la variable manquante : Revenue par Fournisseur
    $revenueByProvider = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
        ->select('services_sms_plus.nom_fournisseur', DB::raw($sumRaw . ' as "total"'))
        ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->groupBy('services_sms_plus.nom_fournisseur')
        ->orderBy(DB::raw($sumRaw), 'desc')
        ->get();

    // 3. Évolution quotidienne (avec correction du bug ORA-00904 "day")
    $revenueByDay = RaTOccAgg::select(
            DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD') as \"day\""), 
            DB::raw($sumRaw . ' as "total"')
        )
        ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"))
        ->orderBy(DB::raw("\"day\""), 'asc')
        ->get();

    return \Inertia\Inertia::render('AnalysteBiz/BizMainView', [
        'revenueByProvider' => $revenueByProvider,
        'revenueByDay'      => $revenueByDay,
        'startDate'         => $startDate,
        'endDate'           => $endDate,
    ]);
}
// À ajouter dans AnalysteBusinessController.php

public function topServicesPage(Request $request)
{
    // Récupération des dates (on réutilise votre logique de détection Oracle)
    $range = RaTOccAgg::select(
        DB::raw("MIN(start_date) as min_d"),
        DB::raw("MAX(start_date) as max_d")
    )->first();

    $startDate = $request->start_date ?? ($range->max_d ? Carbon::parse($range->max_d)->startOfMonth()->toDateString() : now()->startOfMonth()->toDateString());
    $endDate = $request->end_date ?? ($range->max_d ? Carbon::parse($range->max_d)->toDateString() : now()->toDateString());

    $sumRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

    // Requête pour le Top 20
    $topServices = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
        ->select(
            'services_sms_plus.nom_service',
            'services_sms_plus.nom_fournisseur',
            DB::raw($sumRaw . ' as "total_revenue"')
        )
        ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->groupBy('services_sms_plus.nom_service', 'services_sms_plus.nom_fournisseur')
        ->orderBy(DB::raw($sumRaw), 'desc')
        ->limit(20)
        ->get();

    return Inertia::render('AnalysteBiz/TopServices', [
        'topServices' => $topServices,
        'startDate'   => $startDate,
        'endDate'     => $endDate,
    ]);
}
/**
 * Route: analyste.search
 * Affiche l'interface de recherche MSISDN
 */
// Dans App\Http\Controllers\AnalysteBiz\AnalysteBusinessController.php

/**
 * Affiche la page de recherche (Route: analyste.search)
 */
public function searchPage()
{
    return Inertia::render('AnalysteBiz/MsisdnSearch', [
        'results' => null
    ]);
}

/**
 * Exécute la recherche MSISDN (Route: analyste.api.search)
 */
public function execSearch(Request $request)
{
    // Récupération du numéro saisi
    $msisdn = $request->query('msisdn');
    
    if (!$msisdn) {
        return Inertia::render('AnalysteBiz/MsisdnSearch', ['results' => []]);
    }

    // Requête adaptée à votre table RA_T_OCC_AGG
    $results = RaTOccAgg::where('B_MSISDN', 'LIKE', '%' . $msisdn . '%')
                ->select(
                    'B_MSISDN as msisdn', 
                    'START_DATE as date', 
                    'KEYWORD as keyword', 
                    'CHARGE_AMOUNT as amount',
                    'START_HOUR as hour'
                )
                ->orderBy('START_DATE', 'desc')
                ->limit(50)
                ->get();

    return Inertia::render('AnalysteBiz/MsisdnSearch', [
        'results' => $results,
        'filters' => ['msisdn' => $msisdn]
    ]);
}
}