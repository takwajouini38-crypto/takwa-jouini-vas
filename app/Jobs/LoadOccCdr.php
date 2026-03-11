<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;

class LoadOccCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
    }

    public function handle()
    {
        set_time_limit(0);

        Log::info('LoadOccCdr - Début du job pour job ID : ' . $this->jobId);

        $jobModel = JobTask::find($this->jobId);
        if (!$jobModel) {
            Log::error('LoadOccCdr - Job introuvable : ' . $this->jobId);
            return;
        }

        $disk = Storage::disk('cdr_storage'); // storage/app/cdr
        $files = $disk->files('occ');

        Log::info('LoadOccCdr - Nombre de fichiers trouvés : ' . count($files));
        Log::info('Liste des fichiers OCC : ' . implode(', ', $files));

        foreach ($files as $filePath) {

            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::info('LoadOccCdr - Arrêt demandé avant fichier : ' . $filePath);
                break;
            }

            if (!str_ends_with($filePath, '.csv')) {
                Log::info('LoadOccCdr - Fichier ignoré (pas CSV) : ' . $filePath);
                continue;
            }

            $fileFullPath = $disk->path($filePath);
            $handle = fopen($fileFullPath, 'r');
            if (!$handle) {
                Log::error('Impossible d\'ouvrir le fichier : ' . $filePath);
                continue;
            }

            // Lire l'entête
            $header = fgetcsv($handle, 0, ",");
            if (!$header) {
                Log::error('Fichier vide ou entête manquante : ' . $filePath);
                fclose($handle);
                continue;
            }

            $batch = [];
            $lineNumber = 0;

            while (($line = fgetcsv($handle, 0, ",")) !== false) {
                $lineNumber++;
                if (count($line) < 1) continue;

                $row = [
                    "B_DATASOURCE"      => trim($line[6] ?? null),
                    "A_MSISDN"        => trim($line[3] ?? null),
                    "B_MSISDN"        => trim($line[8] ?? null),
                    "PROC_DATE"       => trim($line[39] ?? null),
                    "PROC_HOUR"       => trim($line[40] ?? null),
                    "APN"             => trim($line[1] ?? null),
                    "CALL_TYPE"       => trim($line[11] ?? null),
                    "EVENT_TYPE_ORIG" => trim($line[28] ?? null),
                    "SUBSCRIBER_TYPE" => trim($line[56] ?? null),
                    "ROAMING_TYPE"    => trim($line[50] ?? null),
                    "PARTNER"         => trim($line[35] ?? null),
                    "CHARGE_AMOUNT_ORIG"   => is_numeric(str_replace(',', '.', $line[17] ?? null)) ? str_replace(',', '.', $line[17]) : null,
                    "SERVICE_ID"         => trim($line[52] ?? null),
                    "ORIG_START_TIME" => trim($line[34] ?? null),
                ];

                $batch[] = $row;

                if (count($batch) >= 1000) {
                    DB::table('RA_T_TMP_OCC')->insert($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                DB::table('RA_T_TMP_OCC')->insert($batch);
            }

            fclose($handle);

            Log::info("Fichier $filePath traité : $lineNumber lignes insérées dans TMP");

            // TMP → DETAIL
            try {
                DB::statement("
INSERT INTO RA_T_OCC_CDR_DETAIL (
    DATASOURCE,
    A_MSISDN,
    B_MSISDN,
    START_DATE,
    START_HOUR,
    APN,
    CALL_TYPE,
    EVENT_TYPE,
    SUBSCRIBER_TYPE,
    ROAMING_TYPE,
    PARTNER,
    CHARGE_AMOUNT,
    KEYWORD,
    ORIG_START_TIME
)

SELECT
    TRIM(B_DATASOURCE),

    TRIM(A_MSISDN),

    TRIM(B_MSISDN),

    CASE
        WHEN REGEXP_LIKE(SUBSTR(TRIM(ORIG_START_TIME),1,8),'^[0-9]{8}$')
        THEN TO_DATE(SUBSTR(TRIM(ORIG_START_TIME),1,8),'YYYYMMDD')
        ELSE NULL
    END,

    CASE
        WHEN REGEXP_LIKE(SUBSTR(TRIM(PROC_HOUR),1,2),'^[0-9]{1,2}$')
        THEN TO_NUMBER(SUBSTR(TRIM(PROC_HOUR),1,2))
        ELSE NULL
    END,

    TRIM(APN),

    TRIM(CALL_TYPE),

    74,

    SUBSTR(TRIM(SUBSCRIBER_TYPE),1,20),

    SUBSTR(TRIM(ROAMING_TYPE),1,10),

    SUBSTR(TRIM(PARTNER),1,50),

    CASE
        WHEN REGEXP_LIKE(CHARGE_AMOUNT_ORIG,'^[0-9]+(\.[0-9]+)?$')
        THEN ROUND(TO_NUMBER(CHARGE_AMOUNT_ORIG),2)
        ELSE NULL
    END,

    SUBSTR(TRIM(SERVICE_ID),1,50),

    TRIM(ORIG_START_TIME)

FROM RA_T_TMP_OCC

WHERE TRIM(A_MSISDN) IS NOT NULL
AND TRIM(B_MSISDN) IS NOT NULL
");
            } catch (\Exception $e) {
                Log::error("Erreur TMP → DETAIL dans le fichier $filePath : " . $e->getMessage());
                throw $e;
            }

            // Nettoyer TMP
            DB::statement("TRUNCATE TABLE RA_T_TMP_OCC");

            // Déplacer le fichier traité
            $disk->move($filePath, 'occ/processed/' . basename($filePath));
        }

        Log::info('LoadOccCdr - Fin du job pour job ID : ' . $this->jobId);
    }
}