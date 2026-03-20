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
    protected $batchSize = 1000; // Ajustable selon mémoire

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
    }

    public function handle()
    {
        set_time_limit(0);
        Log::info("Load OCC Optimized - Start job {$this->jobId}");

        $jobModel = JobTask::find($this->jobId);
        if (!$jobModel) {
            Log::error("Job introuvable: {$this->jobId}");
            return;
        }

        $disk = Storage::disk('cdr_storage');
        $files = $disk->files('occ');
        Log::info("Nombre de fichiers OCC: " . count($files));

        foreach ($files as $filePath) {
            $jobModel->refresh();
            if ($jobModel->status !== 'running') break;

            if (!str_ends_with($filePath, '.csv')) continue;

            $fileFullPath = $disk->path($filePath);
            $handle = fopen($fileFullPath, 'r');
            if (!$handle) {
                Log::error("Impossible d'ouvrir le fichier: {$filePath}");
                continue;
            }

            // Lire entête
            $header = fgetcsv($handle, 0, ",");
            if (!$header || count($header) < 65) {
                fclose($handle);
                Log::error("Entête invalide: {$filePath}");
                continue;
            }

            $batch = [];
            $lineNumber = 0;

            while (($line = fgetcsv($handle, 0, ",")) !== false) {
                $lineNumber++;
                if ($lineNumber % 100 == 0) {
    Log::info("Fichier {$filePath} - Ligne $lineNumber traitée");
}
                if (count($line) != count($header)) continue;

                // Ajouter toutes les colonnes en batch
                $row = [];
                foreach ($line as $i => $value) {
                    $row[$header[$i]] = $value; // trim seulement si nécessaire
                }
                $batch[] = $row;
                // Log de progression toutes les 1000 lignes
    if ($lineNumber % 1000 == 0) {
        Log::info("Fichier {$filePath} - Ligne $lineNumber traitée");
    }

                if (count($batch) >= $this->batchSize) {
                    DB::table('RA_T_TMP_OCC')->insert($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                DB::table('RA_T_TMP_OCC')->insert($batch);
            }

            fclose($handle);
            Log::info("Fichier {$filePath} traité: {$lineNumber} lignes insérées dans TMP");

            // TMP → DETAIL (optimisé sans trim répétitif)
            DB::statement("
INSERT INTO RA_T_OCC_CDR_DETAIL (
    DATASOURCE, A_MSISDN, B_MSISDN, START_DATE, START_HOUR, APN, CALL_TYPE,
    EVENT_TYPE, SUBSCRIBER_TYPE, ROAMING_TYPE, PARTNER, CHARGE_AMOUNT, KEYWORD, ORIG_START_TIME
)
SELECT
    B_DATASOURCE,
    A_MSISDN,
    B_MSISDN,
    CASE
        WHEN REGEXP_LIKE(SUBSTR(ORIG_START_TIME,1,8),'^[0-9]{8}$')
        THEN TO_DATE(SUBSTR(ORIG_START_TIME,1,8),'YYYYMMDD')
        ELSE NULL
    END,
    CASE
        WHEN REGEXP_LIKE(SUBSTR(PROC_HOUR,1,2),'^[0-9]{1,2}$')
        THEN TO_NUMBER(SUBSTR(PROC_HOUR,1,2))
        ELSE NULL
    END,
    APN,
    CALL_TYPE,
    EVENT_TYPE,
    SUBSCRIBER_TYPE,
    ROAMING_TYPE,
    PARTNER,
    CASE
        WHEN REGEXP_LIKE(CHARGE_AMOUNT_ORIG,'^[0-9]+(\.[0-9]+)?$')
        THEN ROUND(TO_NUMBER(CHARGE_AMOUNT_ORIG),2)
        ELSE NULL
    END,
    SERVICE_ID,
    ORIG_START_TIME
FROM RA_T_TMP_OCC
WHERE A_MSISDN IS NOT NULL AND B_MSISDN IS NOT NULL
            ");

            // Nettoyer TMP
            DB::statement("TRUNCATE TABLE RA_T_TMP_OCC");

            // Déplacer le fichier
            $disk->move($filePath, 'occ/processed/' . basename($filePath));
        }

        Log::info("Load OCC Optimized - Fin job {$this->jobId}");
    }
}