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
    // 1. Détermination de la période (Dernier mois disponible dans la base)
    $range = RaTOccAgg::select(DB::raw("MIN(start_date) as min_d"), DB::raw("MAX(start_date) as max_d"))->first();
    
    $maxDateRaw = $range->max_d ?? now()->toDateString();
    
    $startDate = $request->start_date ?? Carbon::parse($maxDateRaw)->startOfMonth()->toDateString();
    $endDate = $request->end_date ?? Carbon::parse($maxDateRaw)->toDateString();
    
    $sumRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

    // 2. Calcul du nombre total de fournisseurs
    $providersCount = \App\Models\ServiceProvider::count();

    // 3. Calcul du Revenu Total
    $totalRevenue = RaTOccAgg::whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->select(DB::raw($sumRaw . ' as total'))
        ->first()
        ->total ?? 0;

    // --- ÉTAPES MANQUANTES AJOUTÉES ICI ---

    // 4. Données pour le graphique par fournisseur (indispensable si votre vue l'attend)
  $revenueByProvider = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
    ->join('service_providers', 'services_sms_plus.provider_id', '=', 'service_providers.id')
    ->select(
        'service_providers.provider_name as nom_fournisseur', 
        DB::raw($sumRaw . ' as total')
    )
    ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
    ->groupBy('service_providers.provider_name')
    ->orderBy(DB::raw($sumRaw), 'desc')
    ->get();

    // 5. Données pour le graphique temporel (Revenu par jour) -> RÉSOUT L'ERREUR
    $revenueByDay = RaTOccAgg::select(
            DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD') as \"day\""), 
            DB::raw($sumRaw . ' as "total"')
        )
        ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"))
        ->orderBy(DB::raw("\"day\""), 'asc')
        ->get();

    // 6. Retour vers Inertia
    return Inertia::render('AnalysteBiz/BizMainView', [
        'stats' => [
            'total_providers' => $providersCount,
            'period_revenue'  => (float)$totalRevenue,
        ],
        'revenueByProvider' => $revenueByProvider, // Ajouté pour éviter une autre erreur potentielle
        'revenueByDay'      => $revenueByDay,      // Variable maintenant définie
        'startDate'         => $startDate,
        'endDate'           => $endDate,
    ]);
}   public function searchPage()
    {
        return Inertia::render('AnalysteBiz/MsisdnSearch', ['results' => null]);
    }

    public function execSearch(Request $request)
    {
        $msisdn = $request->query('msisdn') ?: $request->input('msisdn');

        if (!$msisdn) {
            return Inertia::render('AnalysteBiz/MsisdnSearch', [
                'results' => null,
                'filters' => ['msisdn' => '']
            ]);
        }

        // Ajout des alias indispensables pour le Frontend
        $results = RaTOccAgg::where('B_MSISDN', 'LIKE', '%' . trim($msisdn) . '%')
                    ->select([
                        'B_MSISDN as msisdn', 
                        'START_DATE as date', 
                        'START_HOUR as hour', 
                        'KEYWORD as keyword', 
                        'CHARGE_AMOUNT as amount'
                    ])
                    ->orderBy('START_DATE', 'desc')
                    ->limit(500)
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
                if ($key == 1) continue; 
                $val = trim($row['A']);
                if (!empty($val)) $msisdns[] = $val;
            }

            if (empty($msisdns)) {
                return back()->withErrors(['excel_file' => 'Aucun numéro trouvé en colonne A.']);
            }

            $results = RaTOccAgg::whereIn('B_MSISDN', $msisdns)
                        ->select([
                            'B_MSISDN as msisdn', 
                            'START_DATE as date', 
                            'KEYWORD as keyword', 
                            'CHARGE_AMOUNT as amount',
                            'START_HOUR as hour'
                        ])
                        ->orderBy('START_DATE', 'desc')
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

        $sheet->setCellValue('A1', 'MSISDN');
        $sheet->setCellValue('B1', 'DATE');
        $sheet->setCellValue('C1', 'HEURE');
        $sheet->setCellValue('D1', 'KEYWORD');
        $sheet->setCellValue('E1', 'MONTANT (TND)');
        $sheet->getStyle('A1:E1')->getFont()->setBold(true);

        $rowIdx = 2;
        foreach ($results as $r) {
            $sheet->setCellValueExplicit('A'.$rowIdx, $r->msisdn, DataType::TYPE_STRING);
            $sheet->setCellValue('B'.$rowIdx, $r->date);
            $sheet->setCellValue('C'.$rowIdx, $r->hour);
            $sheet->setCellValue('D'.$rowIdx, $r->keyword);
            $sheet->setCellValue('E'.$rowIdx, $r->amount);
            $rowIdx++;
        }

        if (ob_get_length()) ob_end_clean();
        $writer = new Xlsx($spreadsheet);
        $fileName = 'Resultat_Batch_TT_' . now()->format('Ymd_His') . '.xlsx';

        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }
    // 1. Vue par Fournisseur
// Dans AnalysteBusinessController.php

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
