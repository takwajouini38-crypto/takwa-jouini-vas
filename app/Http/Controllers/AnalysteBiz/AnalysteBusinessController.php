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
    DB::raw("TO_CHAR(a.start_date, 'YYYY-MM-DD') as start_date_formatted"),
    DB::raw('COUNT(*) as nb_taxation'),
    DB::raw('SUM(b.price) as tnd_amount')
])
        ->where('a.a_msisdn', 'LIKE', '%' . trim($msisdn) . '%')
       ->groupBy(
    'p.provider_name',
    'b.service_name',
    'b.price',
    'a.a_msisdn',
    'a.b_msisdn',
    DB::raw("TO_CHAR(a.start_date, 'YYYY-MM-DD')")
)
        ->get();

    return Inertia::render('AnalysteBiz/MsisdnSearch', [
        'results' => $results,
        'filters' => ['msisdn' => $msisdn]
    ]);
}
public function topServicesPage(Request $request)
{
    // 1. Validation des dates
    $request->validate([
        'start_date' => 'nullable|date',
        'end_date'   => 'nullable|date|after_or_equal:start_date',
    ]);

    // 2. Récupération de la date maximale en base
    $range = RaTMmgAgg::select(DB::raw("MAX(start_date) as max_d"))->first();
    $maxDbDate = $range->max_d ? Carbon::parse($range->max_d) : now();

    $isUserFiltering = $request->filled('start_date') && $request->filled('end_date');

    if ($isUserFiltering) {
        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate   = Carbon::parse($request->end_date)->endOfDay();
    } else {
        // Par défaut : du 1er du mois à la date max
        $startDate = $maxDbDate->copy()->startOfMonth()->startOfDay();
        $endDate   = $maxDbDate->copy()->endOfDay();
    }

    // 3. VÉRIFICATION : Existence des dates en base (Inspiration TrafficMonitoring)
    $startExists = RaTMmgAgg::whereRaw("TRUNC(start_date) = TO_DATE(?, 'YYYY-MM-DD')", [$startDate->toDateString()])
        ->exists();
        
    $endExists = RaTMmgAgg::whereRaw("TRUNC(start_date) = TO_DATE(?, 'YYYY-MM-DD')", [$endDate->toDateString()])
        ->exists();

    $hasData = ($startExists && $endExists);
    $topServices = collect([]);

    // 4. CALCUL DU TOP 20 (Seulement si les données existent)
    if ($hasData) {
        $sumRaw = "SUM(services_sms_plus.price * ra_t_mmg_agg.cdr_count)";

        $topServices = RaTMmgAgg::join('services_sms_plus', 'ra_t_mmg_agg.service_type', '=', 'services_sms_plus.keyword')
            ->join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
            ->select(
                'services_sms_plus.service_name',
                'service_providers.provider_name as nom_fournisseur', 
                DB::raw("$sumRaw as total_revenue")
            )
            ->whereBetween('ra_t_mmg_agg.start_date', [$startDate, $endDate])
            ->groupBy('services_sms_plus.service_name', 'service_providers.provider_name')
            ->orderByDesc('total_revenue')
            ->limit(20)
            ->get()
            ->map(fn($item) => [
                'service_name'    => $item->service_name,
                'nom_fournisseur' => $item->nom_fournisseur,
                'total_revenue'   => (float) $item->total_revenue
            ]);
    }

    // 5. RETOUR INERTIA
    return Inertia::render('AnalysteBiz/TopServices', [
        'topServices' => $topServices,
        'hasData'     => $hasData,
        'filters'     => [
            'start_date' => $startDate->toDateString(),
            'end_date'   => $endDate->toDateString(),
        ]
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
      // Dans execBulkSearch
$results = DB::table('ra_t_mmg_cdr_detail as a')
    ->leftJoin('services_sms_plus as b', 'b.short_code', '=', 'a.b_msisdn')
    ->leftJoin('service_providers as p', 'b.provider_id', '=', 'p.id')
    ->select([
        'p.provider_name',
        'b.service_name',
        'b.price',
        'a.a_msisdn',
        'a.b_msisdn',
        // AJOUT DE LA DATE ICI pour qu'elle soit disponible pour l'Excel
        DB::raw("TO_CHAR(a.start_date, 'YYYY-MM-DD') as start_date_formatted"),
        DB::raw('COUNT(*) as nb_taxation'),
        DB::raw('SUM(b.price) as tnd_amount')
    ])
    ->whereIn('a.a_msisdn', $msisdns)
    // N'oubliez pas d'ajouter le format de date dans le groupBy
    ->groupBy('p.provider_name', 'b.service_name', 'b.price', 'a.a_msisdn', 'a.b_msisdn', DB::raw("TO_CHAR(a.start_date, 'YYYY-MM-DD')"))
    ->get();

        return $this->generateBulkExcel($results);

    } catch (\Exception $e) {
        return back()->withErrors(['excel_file' => 'Erreur : ' . $e->getMessage()]);
    }
}

 public function generateBulkExcel($results)
{
    // Initialisation de la feuille de calcul
    $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // 1. Définition des entêtes
    $headers = [
        'A1' => 'FOURNISSEUR',
        'B1' => 'SERVICE',
        'C1' => 'DATE',
        'D1' => 'PRIX UNITAIRE (TND)',
        'E1' => 'A_MSISDN (CLIENT)',
        'F1' => 'B_MSISDN (SHORTCODE)',
        'G1' => 'NB TAXATION',
        'H1' => 'TOTAL REVENU (TND)'
    ];

    foreach ($headers as $cell => $text) {
        $sheet->setCellValue($cell, $text);
    }
    
    // Style de l'entête
    $sheet->getStyle('A1:H1')->getFont()->setBold(true);
    $sheet->getStyle('A1:H1')->getFill()
          ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
          ->getStartColor()->setRGB('F4F7FE');

    // 2. Remplissage des données
    $rowIdx = 2;
    foreach ($results as $r) {
        $sheet->setCellValue('A' . $rowIdx, $r->provider_name ?? 'Inconnu');
        $sheet->setCellValue('B' . $rowIdx, $r->service_name ?? 'N/A');
        
        // CORRECTION : Utilisation de la même clé que le frontend (Inertia)
        // On vérifie plusieurs variantes par sécurité
        $dateValue = $r->start_date_formatted ?? $r->START_DATE ?? $r->start_date ?? 'N/A';
        $sheet->setCellValue('C' . $rowIdx, $dateValue);
        
        $sheet->setCellValue('D' . $rowIdx, number_format((float)($r->price ?? 0), 3, '.', ''));
        
        // Formatage des numéros en texte pour éviter l'affichage scientifique d'Excel
        $sheet->setCellValueExplicit('E' . $rowIdx, $r->a_msisdn, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
        $sheet->setCellValueExplicit('F' . $rowIdx, $r->b_msisdn, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
        
        $sheet->setCellValue('G' . $rowIdx, $r->nb_taxation ?? 0);
        $sheet->setCellValue('H' . $rowIdx, number_format((float)($r->tnd_amount ?? 0), 3, '.', ''));
        
        $rowIdx++;
    }

    // 3. Mise en forme automatique
    foreach (range('A', 'H') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    if (ob_get_length()) ob_end_clean();
    
    $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
    $fileName = 'Resultat_Batch_Investigation_TT_' . now()->format('Ymd_His') . '.xlsx';

    return response()->streamDownload(function() use ($writer) {
        $writer->save('php://output');
    }, $fileName, [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Cache-Control' => 'max-age=0',
        'Pragma' => 'public',
    ]);
}
public function revenueByProviderPage(Request $request)
{
    // 1. Validation des dates saisies
    $request->validate([
        'start_date' => 'nullable|date',
        'end_date'   => 'nullable|date|after_or_equal:start_date',
    ]);

    // 2. Récupération de la date maximale réelle en base
    $range = RaTMmgAgg::select(DB::raw("MAX(start_date) as max_d"))->first();
    $maxDbDate = $range->max_d ? Carbon::parse($range->max_d) : now();

    $isUserFiltering = $request->filled('start_date') && $request->filled('end_date');

    if ($isUserFiltering) {
        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate   = Carbon::parse($request->end_date)->endOfDay();
    } else {
        // Par défaut : le mois précédant la date max
        $startDate = $maxDbDate->copy()->subMonth()->startOfDay();
        $endDate   = $maxDbDate->copy()->endOfDay();
    }

    // 3. VÉRIFICATION : Est-ce que les dates sélectionnées existent en base ?
    // (Inspiration directe du TrafficMonitoringController)
    $startExists = RaTMmgAgg::whereRaw("TRUNC(start_date) = TO_DATE(?, 'YYYY-MM-DD')", [$startDate->toDateString()])
        ->exists();
        
    $endExists = RaTMmgAgg::whereRaw("TRUNC(start_date) = TO_DATE(?, 'YYYY-MM-DD')", [$endDate->toDateString()])
        ->exists();

    // 4. Initialisation des variables pour éviter les erreurs undefined
    $revenueData = collect([]);
    $formattedDetail = [];
    $xAxisKey = 'service_name';
    $hasData = ($startExists && $endExists);

    // 5. CALCUL DU REVENU (Seulement si les dates sont valides en base)
    if ($hasData) {
        $sumRaw = "SUM(services_sms_plus.price * ra_t_mmg_agg.cdr_count)";

        $revenueData = RaTMmgAgg::join('services_sms_plus', 'ra_t_mmg_agg.service_type', '=', 'services_sms_plus.keyword')
            ->join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
            ->select(
                'service_providers.provider_name as nom_fournisseur',
                DB::raw("$sumRaw as total")
            )
            ->whereBetween('ra_t_mmg_agg.start_date', [$startDate, $endDate])
            ->groupBy('service_providers.provider_name')
            ->orderByDesc('total')
            ->get()
            ->map(fn($item) => [
                'nom_fournisseur' => $item->nom_fournisseur,
                'total' => (float) $item->total
            ]);

        // LOGIQUE DE DÉTAIL (Si un fournisseur est sélectionné)
        if ($revenueData->isNotEmpty() && $request->provider) {
            $query = RaTMmgAgg::join('services_sms_plus', 'ra_t_mmg_agg.service_type', '=', 'services_sms_plus.keyword')
                ->join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
                ->whereRaw('LOWER(service_providers.provider_name) = LOWER(?)', [$request->provider])
                ->whereBetween('ra_t_mmg_agg.start_date', [$startDate, $endDate]);

            if ($request->service) {
                $xAxisKey = 'date_label';
                $detailData = $query->where('services_sms_plus.service_name', $request->service)
                    ->select(
                        DB::raw("TO_CHAR(ra_t_mmg_agg.start_date, 'YYYY-MM-DD') as date_label"),
                        DB::raw("$sumRaw as total")
                    )
                    ->groupBy(DB::raw("TO_CHAR(ra_t_mmg_agg.start_date, 'YYYY-MM-DD')"))
                    ->orderBy('date_label')
                    ->get();
            } else {
                $detailData = $query->select('services_sms_plus.service_name', DB::raw("$sumRaw as total"))
                    ->groupBy('services_sms_plus.service_name')
                    ->orderByDesc('total')
                    ->get();
            }

            $formattedDetail = $detailData->map(fn($item) => [
                $xAxisKey => $item->$xAxisKey ?? '',
                'total' => (float) ($item->total ?? 0)
            ]);
        }
    }

    // 6. RÉCUPÉRATION DES LISTES POUR LES FILTRES
    $providersList = ServiceProvider::select('provider_name as nom_fournisseur')
        ->distinct()
        ->orderBy('nom_fournisseur')
        ->get();
    
    $availableServices = [];
    if ($request->provider) {
        $availableServices = ServiceSmsPlus::join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
            ->whereRaw('LOWER(service_providers.provider_name) = LOWER(?)', [$request->provider])
            ->select('services_sms_plus.service_name')
            ->distinct()
            ->orderBy('service_name')
            ->get();
    }

    return Inertia::render('AnalysteBiz/RevenueByProvider', [
        'providers'         => $providersList,
        'availableServices' => $availableServices,
        'revenueData'       => $revenueData,
        'servicesDetail'    => $formattedDetail,
        'xAxisKey'          => $xAxisKey,
        'hasData'           => $hasData,
        'filters'           => [
            'provider'   => $request->provider,
            'service'    => $request->service,
            'start_date' => $startDate->toDateString(),
            'end_date'   => $endDate->toDateString(),
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
