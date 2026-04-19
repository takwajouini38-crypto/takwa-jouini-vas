<?php

namespace App\Http\Controllers\AnalysteBiz;

use App\Http\Controllers\Controller;
use App\Models\ServiceSmsPlus;
use App\Models\RaTOccAgg;
use App\Models\RaTMmgAgg;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use App\Models\ServiceProvider;

class AnalysteBusinessController extends Controller
{
    

    public function exportExcel(Request $request) 
    {
        $msisdn = $request->input('msisdn') ?: $request->query('msisdn');
        $startDate = $request->input('start_date') ?? now()->startOfMonth()->toDateString();
        $endDate = $request->input('end_date') ?? now()->toDateString();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        if (!empty($msisdn)) {
            $searchTerm = trim($msisdn);
            $fileName = "Extraction_MSISDN_" . $searchTerm . ".xlsx";
            
            $data = RaTOccAgg::where('B_MSISDN', 'LIKE', '%' . $searchTerm . '%')
                        ->select([
                            'B_MSISDN as msisdn', 
                            'START_DATE as date', 
                            'START_HOUR as hour', 
                            'KEYWORD as keyword', 
                            'CHARGE_AMOUNT as amount'
                        ])
                        ->orderBy('START_DATE', 'desc')
                        ->get();

            $sheet->setCellValue('A1', 'MSISDN');
            $sheet->setCellValue('B1', 'DATE');
            $sheet->setCellValue('C1', 'HEURE');
            $sheet->setCellValue('D1', 'KEYWORD');
            $sheet->setCellValue('E1', 'MONTANT (TND)');

            $rowIdx = 2;
            foreach ($data as $row) {
                $sheet->setCellValueExplicit('A' . $rowIdx, $row->msisdn, DataType::TYPE_STRING);
                $sheet->setCellValue('B' . $rowIdx, $row->date);
                $sheet->setCellValue('C' . $rowIdx, $row->hour);
                $sheet->setCellValue('D' . $rowIdx, $row->keyword);
                $sheet->setCellValue('E' . $rowIdx, $row->amount);
                $rowIdx++;
            }
        } else {
            $fileName = "Rapport_Global_Revenus_TT.xlsx";
            $data = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
    ->join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
    ->select([
        'services_sms_plus.service_name', 
        'service_providers.provider_name as nom_fournisseur', 
        'ra_t_occ_agg.keyword', 
        DB::raw("SUM(TO_NUMBER(REPLACE(charge_amount, ',', '.'))) as total")
    ])
    ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
    ->groupBy(
        'services_sms_plus.service_name', 
        'service_providers.provider_name',
        'ra_t_occ_agg.keyword'
    )
    ->get();

            $sheet->setCellValue('A1', 'SERVICE');
            $sheet->setCellValue('B1', 'FOURNISSEUR');
            $sheet->setCellValue('C1', 'KEYWORD');
            $sheet->setCellValue('D1', 'TOTAL REVENU (TND)');

            $rowIdx = 2;
            foreach ($data as $row) {
                $sheet->setCellValue('A' . $rowIdx, $row->service_name);
                $sheet->setCellValue('B' . $rowIdx, $row->nom_fournisseur);
                $sheet->setCellValue('C' . $rowIdx, $row->keyword);
                $sheet->setCellValue('D' . $rowIdx, number_format($row->total, 3, '.', ''));
                $rowIdx++;
            }
        }

        if (ob_get_length()) ob_end_clean();
        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

   public function dashboard(Request $request)
    {
        // 1. Détermination de la période
        $range = RaTOccAgg::select(DB::raw("MIN(start_date) as min_d"), DB::raw("MAX(start_date) as max_d"))->first();
        
        $maxDateRaw = $range->max_d ?? now()->toDateString();
        
        $startDate = $request->start_date ?? Carbon::parse($maxDateRaw)->startOfMonth()->toDateString();
        $endDate = $request->end_date ?? Carbon::parse($maxDateRaw)->toDateString();
        
        // CORRECTION : Ne pas utiliser d'alias 'r' ici car pas de jointure
        $sumRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

        // 2. Calcul du nombre total de fournisseurs
        $providersCount = ServiceProvider::count();
        
        // 3. Dernier fournisseur créé
        $lastProvider = ServiceProvider::orderBy('created_at', 'desc')->first();
        
        // 4. Nombre d'alertes
        $alertsCount = DB::table('alerts')->count();
        
        // 5. Dernières alertes (5 dernières)
        $latestAlerts = DB::table('alerts')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
        
        // 6. Alertes par motif
        try {
            $alertsByMotif = DB::table('alerts')
                ->select(DB::raw("CAST(motif AS VARCHAR2(255)) as motif"), DB::raw('count(*) as total'))
                ->groupBy(DB::raw("CAST(motif AS VARCHAR2(255))"))
                ->get();
        } catch (\Exception $e) {
            $allMotifs = DB::table('alerts')->select('motif')->get();
            $motifCounts = [];
            foreach ($allMotifs as $item) {
                $motif = (string)$item->motif;
                if (!isset($motifCounts[$motif])) {
                    $motifCounts[$motif] = 0;
                }
                $motifCounts[$motif]++;
            }
            
            $alertsByMotif = [];
            foreach ($motifCounts as $motif => $count) {
                $alertsByMotif[] = (object)['motif' => $motif, 'total' => $count];
            }
        }

        // 7. Calcul du Revenu Total - CORRECTION : Pas d'alias 'r'
        $totalRevenue = RaTOccAgg::whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
            ->select(DB::raw($sumRaw . ' as total'))
            ->first()
            ->total ?? 0;

        // 8. Revenu par fournisseur (top 5) - CORRECTION : Utiliser le bon nom de colonne
        // D'abord, vérifions si la colonne provider_name existe dans RA_T_OCC_AGG
        $revenueByProvider = [];
        
        try {
            // Essayer de récupérer directement depuis RA_T_OCC_AGG s'il y a une colonne fournisseur
            $revenueByProvider = RaTOccAgg::whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
                ->select('PROVIDER', DB::raw($sumRaw . ' as revenue'))
                ->groupBy('PROVIDER')
                ->orderBy('revenue', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return (object)[
                        'provider_name' => $item->provider,
                        'revenue' => $item->revenue
                    ];
                });
        } catch (\Exception $e) {
            // Si pas de colonne PROVIDER, laisser vide
            $revenueByProvider = [];
        }

        return Inertia::render('AnalysteBiz/BizMainView', [
            'stats' => [
                'total_providers' => $providersCount,
                'period_revenue'  => (float)$totalRevenue,
                'alerts_count' => $alertsCount,
            ],
            'lastProvider' => $lastProvider,
            'latestAlerts' => $latestAlerts,
            'alertsByMotif' => $alertsByMotif,
            'revenueByProvider' => $revenueByProvider,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }
      public function searchPage()
    {
        return Inertia::render('AnalysteBiz/MsisdnSearch', ['results' => null]);
    }

    public function execSearch(Request $request)
{
    $msisdn = $request->query('msisdn') ?: $request->input('msisdn');

    if (!$msisdn) {
        return Inertia::render('AnalysteBiz/MsisdnSearch', ['results' => null]);
    }

    // Votre requête adaptée à Eloquent avec la jointure et le groupement
    $results = DB::table('ra_t_mmg_cdr_detail as a')
        ->leftJoin('services_sms_plus as b', 'b.short_code', '=', 'a.b_msisdn')
        ->join('service_providers as p', 'b.provider_id', '=', 'p.id') // Pour avoir le nom du fournisseur
        ->select([
            'p.provider_name',
            'b.service_name',
            'b.price',
            'a.a_msisdn',
            'a.b_msisdn',
            DB::raw('COUNT(*) as nb_taxation'),
            DB::raw('SUM(b.price) as tnd_amount')
        ])
        ->where('a.a_msisdn', 'LIKE', '%' . trim($msisdn) . '%')
        ->groupBy('p.provider_name', 'b.service_name', 'b.price', 'a.a_msisdn', 'a.b_msisdn')
        ->get();

    return Inertia::render('AnalysteBiz/MsisdnSearch', [
        'results' => $results,
        'filters' => ['msisdn' => $msisdn]
    ]);
}
public function topServicesPage(Request $request)
    {
        $range = RaTOccAgg::select(DB::raw("MIN(start_date) as min_d"), DB::raw("MAX(start_date) as max_d"))->first();
        $startDate = $request->start_date ?? ($range->max_d ? Carbon::parse($range->max_d)->startOfMonth()->toDateString() : now()->startOfMonth()->toDateString());
        $endDate = $request->end_date ?? ($range->max_d ? Carbon::parse($range->max_d)->toDateString() : now()->toDateString());
        $sumRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

       $topServices = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
    ->join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
    ->select(
        'services_sms_plus.service_name',
        'service_providers.provider_name as nom_fournisseur', 
        DB::raw($sumRaw . ' as total_revenue')
    )
    ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
    ->groupBy(
    'services_sms_plus.service_name',
    'service_providers.provider_name'
)

    ->orderBy(DB::raw($sumRaw), 'desc')
    ->limit(20)
    ->get();

        return Inertia::render('AnalysteBiz/TopServices', [
            'topServices' => $topServices,
            'startDate'   => $startDate,
            'endDate'     => $endDate,
        ]);
    }


    public function execBulkSearch(Request $request)
{
    $request->validate([
        'excel_file' => 'required|mimes:xlsx,xls,csv|max:10240'
    ]);

    try {
        $path = $request->file('excel_file')->getRealPath();
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($path);
        $sheetData = $spreadsheet->getActiveSheet()->toArray(null, true, true, true);

        $msisdns = [];
        foreach ($sheetData as $key => $row) {
            if ($key == 1) continue; // Sauter l'entête
            $val = trim($row['A']);
            if (!empty($val)) $msisdns[] = $val;
        }

        if (empty($msisdns)) {
            return back()->withErrors(['excel_file' => 'Aucun numéro trouvé en colonne A.']);
        }

        // Requête identique à la recherche unitaire mais avec whereIn
        $results = DB::table('ra_t_mmg_cdr_detail as a')
            ->leftJoin('services_sms_plus as b', 'b.short_code', '=', 'a.b_msisdn')
            ->leftJoin('service_providers as p', 'b.provider_id', '=', 'p.id')
            ->select([
                'p.provider_name',
                'b.service_name',
                'b.price',
                'a.a_msisdn',
                'a.b_msisdn',
                DB::raw('COUNT(*) as nb_taxation'),
                DB::raw('SUM(b.price) as tnd_amount')
            ])
            ->whereIn('a.a_msisdn', $msisdns)
            ->groupBy('p.provider_name', 'b.service_name', 'b.price', 'a.a_msisdn', 'a.b_msisdn')
            ->get();

        return $this->generateBulkExcel($results);

    } catch (\Exception $e) {
        return back()->withErrors(['excel_file' => 'Erreur : ' . $e->getMessage()]);
    }
}

    public function generateBulkExcel($results)
{
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Définition des entêtes conformes au tableau unitaire
    $headers = [
        'A1' => 'FOURNISSEUR',
        'B1' => 'SERVICE',
        'C1' => 'PRIX UNITAIRE (TND)',
        'D1' => 'A_MSISDN (CLIENT)',
        'E1' => 'B_MSISDN (SHORTCODE)',
        'F1' => 'NB TAXATION',
        'G1' => 'TOTAL REVENU (TND)'
    ];

    foreach ($headers as $cell => $text) {
        $sheet->setCellValue($cell, $text);
    }
    
    // Style pour l'entête
    $sheet->getStyle('A1:G1')->getFont()->setBold(true);
    $sheet->getStyle('A1:G1')->getFill()
          ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
          ->getStartColor()->setRGB('F4F7FE');

    $rowIdx = 2;
    foreach ($results as $r) {
        $sheet->setCellValue('A' . $rowIdx, $r->provider_name ?? 'Inconnu');
        $sheet->setCellValue('B' . $rowIdx, $r->service_name ?? 'N/A');
        $sheet->setCellValue('C' . $rowIdx, number_format((float)$r->price, 3, '.', ''));
        
        // On force le format texte pour les MSISDN pour éviter les notations scientifiques (ex: 2.16E+11)
        $sheet->setCellValueExplicit('D' . $rowIdx, $r->a_msisdn, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
        $sheet->setCellValueExplicit('E' . $rowIdx, $r->b_msisdn, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
        
        $sheet->setCellValue('F' . $rowIdx, $r->nb_taxation);
        $sheet->setCellValue('G' . $rowIdx, number_format((float)$r->tnd_amount, 3, '.', ''));
        
        $rowIdx++;
    }

    // Ajustement automatique de la largeur des colonnes
    foreach (range('A', 'G') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    if (ob_get_length()) ob_end_clean();
    
    $writer = new Xlsx($spreadsheet);
    $fileName = 'Resultat_Batch_Investigation_TT_' . now()->format('Ymd_His') . '.xlsx';

    return response()->streamDownload(function() use ($writer) {
        $writer->save('php://output');
    }, $fileName, [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Cache-Control' => 'max-age=0',
    ]);
}
public function revenueByProviderPage(Request $request)
{
    // 1. Dates par défaut (dernier mois dispo)
    $range = RaTOccAgg::select(DB::raw("MAX(start_date) as max_d"))->first();
    $maxDate = $range->max_d ? Carbon::parse($range->max_d) : now();

    $startDate = $request->start_date ?? $maxDate->copy()->startOfMonth()->toDateString();
    $endDate   = $request->end_date ?? $maxDate->toDateString();

    // ✅ IMPORTANT : somme propre (sans bug)
    $sumRaw = "SUM(charge_amount)";

    // 2. Liste fournisseurs
    $providers = ServiceProvider::select('provider_name as nom_fournisseur')
        ->distinct()
        ->orderBy('provider_name')
        ->get();

    // 3. Revenus par fournisseur
    $revenueData = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
        ->join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
        ->select(
            'service_providers.provider_name as nom_fournisseur',
            DB::raw("$sumRaw as total")
        )
        ->whereRaw("TRUNC(start_date) BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->groupBy('service_providers.provider_name')
        ->orderByDesc('total')
        ->get()
        ->map(fn($item) => [
            'nom_fournisseur' => $item->nom_fournisseur,
            'total' => (float) $item->total
        ]);

    // 4. Services disponibles selon fournisseur
    $availableServices = [];

    if ($request->provider) {
        $availableServices = ServiceSmsPlus::join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
            ->whereRaw('LOWER(service_providers.provider_name) = LOWER(?)', [$request->provider])
            ->select('services_sms_plus.service_name')
            ->distinct()
            ->orderBy('service_name')
            ->get();
    }

    // 5. Détails dynamiques
    $detailData = collect([]);
    $xAxisKey = 'service_name';

    if ($request->provider) {

        $query = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
            ->join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
            ->whereRaw('LOWER(service_providers.provider_name) = LOWER(?)', [$request->provider])
            ->whereRaw("TRUNC(start_date) BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate]);

        // 👉 Cas 1 : service sélectionné → évolution par jour
        if ($request->service) {
            $xAxisKey = 'date_label';

            $detailData = $query
                ->where('services_sms_plus.service_name', $request->service)
                ->select(
                    DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD') as date_label"),
                    DB::raw("$sumRaw as total")
                )
                ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"))
                ->orderBy('date_label')
                ->get();
        }

        // 👉 Cas 2 : tous les services du fournisseur
        else {
            $detailData = $query
                ->select(
                    'services_sms_plus.service_name',
                    DB::raw("$sumRaw as total")
                )
                ->groupBy('services_sms_plus.service_name')
                ->orderByDesc('total')
                ->get();
        }
    }

    // 6. Format final pour React
    $formattedDetail = $detailData->map(function ($item) use ($xAxisKey) {
    return [
        $xAxisKey => $item->$xAxisKey ?? '',
        'total' => (float) ($item->total ?? 0)
    ];
});

    return Inertia::render('AnalysteBiz/RevenueByProvider', [
        'providers' => $providers,
        'availableServices' => $availableServices,
        'revenueData' => $revenueData,
        'servicesDetail' => $formattedDetail,
        'xAxisKey' => $xAxisKey,
        'filters' => [
            'provider'   => $request->provider,
            'service'    => $request->service,
            'start_date' => $startDate,
            'end_date'   => $endDate,
        ]
    ]);
}
    /**
     * Fonction utilitaire pour assainir les dates et corriger le bug 0025
     */
    private function sanitizeDate($date, $fallbackDate, $isStartOfMonth = false)
    {
        // Si la date commence par "00", on utilise la date limite de la base de données
        if (!$date || str_starts_with($date, '00')) {
            $base = $fallbackDate ? Carbon::parse($fallbackDate) : now();
            return $isStartOfMonth ? $base->startOfMonth()->toDateString() : $base->toDateString();
        }

        try {
            return Carbon::parse($date)->toDateString();
        } catch (\Exception $e) {
            return now()->toDateString();
        }
    }
/**
 * Fonction d'aide pour transformer n'importe quel format vers DD/MM/YYYY
 */
private function formatDateForOracle($date) {
    if (empty($date)) return null;
    
    try {
        // Si c'est déjà du DD/MM/YYYY, on ne touche à rien
        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
            return $date;
        }
        // Sinon on convertit (ex: 2025-10-01 -> 01/10/2025)
        return \Carbon\Carbon::parse($date)->format('d/m/Y');
    } catch (\Exception $e) {
        return $date;
    }
}

}
