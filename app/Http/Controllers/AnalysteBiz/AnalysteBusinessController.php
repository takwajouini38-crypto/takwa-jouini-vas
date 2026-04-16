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
                        ->select([
                            'services_sms_plus.nom_service', 
                            'services_sms_plus.nom_fournisseur', 
                            'ra_t_occ_agg.keyword', 
                            DB::raw("SUM(TO_NUMBER(REPLACE(charge_amount, ',', '.'))) as total")
                        ])
                        ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
                        ->groupBy('services_sms_plus.nom_service', 'services_sms_plus.nom_fournisseur', 'ra_t_occ_agg.keyword')
                        ->get();

            $sheet->setCellValue('A1', 'SERVICE');
            $sheet->setCellValue('B1', 'FOURNISSEUR');
            $sheet->setCellValue('C1', 'KEYWORD');
            $sheet->setCellValue('D1', 'TOTAL REVENU (TND)');

            $rowIdx = 2;
            foreach ($data as $row) {
                $sheet->setCellValue('A' . $rowIdx, $row->nom_service);
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
    
    // Si la base est vide, on évite les erreurs de Carbon
    $maxDateRaw = $range->max_d ?? now()->toDateString();
    
    $startDate = $request->start_date ?? Carbon::parse($maxDateRaw)->startOfMonth()->toDateString();
    $endDate = $request->end_date ?? Carbon::parse($maxDateRaw)->toDateString();
    
    $sumRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

    // 2. Calcul du nombre total de fournisseurs (Statistique globale)
    $providersCount = ServiceSmsPlus::distinct('nom_fournisseur')->count('nom_fournisseur');

    // 3. Calcul du Revenu Total pour la période sélectionnée
    // On utilise la table agrégée pour plus de performance
    $totalRevenue = RaTOccAgg::whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->select(DB::raw($sumRaw . ' as total'))
        ->first()
        ->total ?? 0;

    // 4. Données pour le graphique par fournisseur
    $revenueByProvider = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
        ->select('services_sms_plus.nom_fournisseur', DB::raw($sumRaw . ' as "total"'))
        ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->groupBy('services_sms_plus.nom_fournisseur')
        ->orderBy(DB::raw($sumRaw), 'desc')
        ->get();

    // 5. Données pour le graphique temporel (Revenu par jour)
    $revenueByDay = RaTOccAgg::select(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD') as \"day\""), DB::raw($sumRaw . ' as "total"'))
        ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"))
        ->orderBy(DB::raw("\"day\""), 'asc')
        ->get();

    // 6. Retour vers Inertia avec les nouvelles stats
    return Inertia::render('AnalysteBiz/BizMainView', [
        'stats' => [
            'total_providers' => $providersCount,
            'period_revenue'  => (float)$totalRevenue,
        ],
        'revenueByProvider' => $revenueByProvider,
        'revenueByDay'      => $revenueByDay,
        'startDate'         => $startDate,
        'endDate'           => $endDate,
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
    // 1. Récupération des dates depuis la requête
    $startDate = $request->start_date;
    $endDate = $request->end_date;

    // Dates par défaut si vides
    if (!$startDate || !$endDate) {
        $range = RaTOccAgg::select(DB::raw("MAX(start_date) as max_d"))->first();
        $maxDateInDb = $range->max_d ? Carbon::parse($range->max_d) : now();
        
        $startDate = $startDate ?: $maxDateInDb->copy()->startOfMonth()->toDateString();
        $endDate = $endDate ?: $maxDateInDb->toDateString();
    }

    // 2. VÉRIFICATION : Est-ce que les dates existent dans la base de données ?
    // On vérifie si start_date et end_date existent individuellement
    $startExists = RaTOccAgg::whereRaw("TRUNC(start_date) = TO_DATE(?, 'YYYY-MM-DD')", [$startDate])->exists();
    $endExists = RaTOccAgg::whereRaw("TRUNC(start_date) = TO_DATE(?, 'YYYY-MM-DD')", [$endDate])->exists();

    // Si l'une des dates n'existe pas, on initialise des données vides
    if (!$startExists || !$endExists) {
        return Inertia::render('AnalysteBiz/RevenueByProvider', [
            'providers' => ServiceSmsPlus::select('nom_fournisseur')->distinct()->get(),
            'availableServices' => [],
            'revenueData' => [],
            'servicesDetail' => [],
            'xAxisKey' => 'nom_service',
            'filters' => [
                'provider'   => $request->provider,
                'service'    => $request->service,
                'start_date' => $startDate,
                'end_date'   => $endDate,
            ]
        ]);
    }

    // 3. Requête principale : Revenus par Fournisseur (si les dates existent)
    $revenueData = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
        ->select(
            'services_sms_plus.nom_fournisseur', 
            DB::raw("SUM(TO_NUMBER(REPLACE(charge_amount, ',', '.'))) as total")
        )
        ->whereRaw("TRUNC(start_date) >= TO_DATE(?, 'YYYY-MM-DD')", [$startDate])
        ->whereRaw("TRUNC(start_date) <= TO_DATE(?, 'YYYY-MM-DD')", [$endDate])
        ->groupBy('services_sms_plus.nom_fournisseur')
        ->get()
        ->map(fn($item) => [
            'nom_fournisseur' => $item->nom_fournisseur ?? $item->NOM_FOURNISSEUR,
            'total' => (float)($item->total ?? $item->TOTAL ?? 0)
        ]);

    // 4. Détail dynamique
    $detailData = collect([]);
    $xAxisKey = 'nom_service';

    if ($request->provider && $revenueData->isNotEmpty()) {
        $queryDetail = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
            ->where('services_sms_plus.nom_fournisseur', $request->provider)
            ->whereRaw("TRUNC(start_date) >= TO_DATE(?, 'YYYY-MM-DD')", [$startDate])
            ->whereRaw("TRUNC(start_date) <= TO_DATE(?, 'YYYY-MM-DD')", [$endDate]);

        if ($request->service) {
            $xAxisKey = 'date_label';
            $detailData = $queryDetail->where('services_sms_plus.nom_service', $request->service)
                ->select(
                    DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD') as date_label"),
                    DB::raw("SUM(TO_NUMBER(REPLACE(charge_amount, ',', '.'))) as total")
                )
                ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"))
                ->orderBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"), 'asc')
                ->get();
        } else {
            $detailData = $queryDetail->select(
                    'services_sms_plus.nom_service', 
                    DB::raw("SUM(TO_NUMBER(REPLACE(charge_amount, ',', '.'))) as total")
                )
                ->groupBy('services_sms_plus.nom_service')
                ->orderBy(DB::raw("SUM(TO_NUMBER(REPLACE(charge_amount, ',', '.')))"), 'desc')
                ->get();
        }
    }

    return Inertia::render('AnalysteBiz/RevenueByProvider', [
        'providers' => ServiceSmsPlus::select('nom_fournisseur')->distinct()->get(),
        'availableServices' => $request->provider ? ServiceSmsPlus::where('nom_fournisseur', $request->provider)->select('nom_service')->distinct()->get() : [],
        'revenueData' => $revenueData,
        'servicesDetail' => $detailData->map(fn($item) => [
            $xAxisKey => $item->$xAxisKey ?? $item->{strtoupper($xAxisKey)},
            'total' => (float)($item->total ?? $item->TOTAL ?? 0)
        ]),
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
// 2. Vue par Service
public function revenueByServicePage(Request $request)
{
    $range = RaTOccAgg::select(DB::raw("MIN(start_date) as min_d"), DB::raw("MAX(start_date) as max_d"))->first();
    $startDate = $request->start_date ?? Carbon::parse($range->max_d)->startOfMonth()->toDateString();
    $endDate = $request->end_date ?? Carbon::parse($range->max_d)->toDateString();

    $revenueByService = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
        ->select('services_sms_plus.nom_service', DB::raw('SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\'))) as "total"'))
        ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
        ->groupBy('services_sms_plus.nom_service')
        ->orderBy(DB::raw('SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))'), 'desc')
        // On peut augmenter la limite car on est en plein écran
        
        ->get();

    return Inertia::render('AnalysteBiz/RevenueByService', [
        'data' => $revenueByService,
        'startDate' => $startDate,
        'endDate' => $endDate
    ]);
}

}
