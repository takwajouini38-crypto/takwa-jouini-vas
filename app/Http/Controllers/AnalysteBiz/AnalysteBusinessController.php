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
    public function analytics(Request $request)
    {
        $range = RaTOccAgg::select(
            DB::raw("MIN(start_date) as min_d"),
            DB::raw("MAX(start_date) as max_d")
        )->first();

        $defaultEnd = $range->max_d ? Carbon::parse($range->max_d)->toDateString() : now()->toDateString();
        $defaultStart = $range->max_d ? Carbon::parse($range->max_d)->startOfMonth()->toDateString() : now()->startOfMonth()->toDateString();

        $startDate = $request->start_date ?? $defaultStart;
        $endDate = $request->end_date ?? $defaultEnd;

        $sumRevenueRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

        $revenueByProvider = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
            ->select('services_sms_plus.nom_fournisseur', DB::raw($sumRevenueRaw . ' as "total"'))
            ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
            ->groupBy('services_sms_plus.nom_fournisseur')
            ->orderBy(DB::raw($sumRevenueRaw), 'desc')
            ->get();

        $revenueByService = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
            ->select('services_sms_plus.nom_service', DB::raw('SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\'))) as "total"'))
            ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
            ->groupBy('services_sms_plus.nom_service')
            ->orderBy(DB::raw('SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))'), 'desc')
            ->limit(8)
            ->get();

        $revenueByDay = RaTOccAgg::whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
            ->select(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD') as \"day\""), DB::raw($sumRevenueRaw . ' as "total"'))
            ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"))
            ->orderBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"), 'asc')
            ->get();

        $revenueByMonth = RaTOccAgg::select(DB::raw("TO_CHAR(start_date, 'YYYY-MM') as \"month\""), DB::raw($sumRevenueRaw . ' as "total"'))
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
        $range = RaTOccAgg::select(DB::raw("MIN(start_date) as min_d"), DB::raw("MAX(start_date) as max_d"))->first();
        $startDate = $request->start_date ?? ($range->max_d ? Carbon::parse($range->max_d)->startOfMonth()->toDateString() : now()->startOfMonth()->toDateString());
        $endDate = $request->end_date ?? ($range->max_d ? Carbon::parse($range->max_d)->toDateString() : now()->toDateString());
        $sumRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

        $revenueByProvider = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
            ->select('services_sms_plus.nom_fournisseur', DB::raw($sumRaw . ' as "total"'))
            ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
            ->groupBy('services_sms_plus.nom_fournisseur')
            ->orderBy(DB::raw($sumRaw), 'desc')
            ->get();

        $revenueByDay = RaTOccAgg::select(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD') as \"day\""), DB::raw($sumRaw . ' as "total"'))
            ->whereRaw("start_date BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [$startDate, $endDate])
            ->groupBy(DB::raw("TO_CHAR(start_date, 'YYYY-MM-DD')"))
            ->orderBy(DB::raw("\"day\""), 'asc')
            ->get();

        return Inertia::render('AnalysteBiz/BizMainView', [
            'revenueByProvider' => $revenueByProvider,
            'revenueByDay'      => $revenueByDay,
            'startDate'         => $startDate,
            'endDate'           => $endDate,
        ]);
    }

    public function topServicesPage(Request $request)
    {
        $range = RaTOccAgg::select(DB::raw("MIN(start_date) as min_d"), DB::raw("MAX(start_date) as max_d"))->first();
        $startDate = $request->start_date ?? ($range->max_d ? Carbon::parse($range->max_d)->startOfMonth()->toDateString() : now()->startOfMonth()->toDateString());
        $endDate = $request->end_date ?? ($range->max_d ? Carbon::parse($range->max_d)->toDateString() : now()->toDateString());
        $sumRaw = 'SUM(TO_NUMBER(REPLACE(charge_amount, \',\', \'.\')))';

        $topServices = RaTOccAgg::join('services_sms_plus', 'ra_t_occ_agg.keyword', '=', 'services_sms_plus.keyword')
            ->select('services_sms_plus.nom_service', 'services_sms_plus.nom_fournisseur', DB::raw($sumRaw . ' as "total_revenue"'))
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
}