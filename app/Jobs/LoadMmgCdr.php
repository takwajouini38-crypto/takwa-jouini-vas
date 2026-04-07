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
use App\Services\OracleConnectorService; // ✅ Import du service

class LoadMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;
    protected $batchSize = 1000;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
    }

    // ✅ Injection du service dans handle
    public function handle(OracleConnectorService $oracleService)
    {
        set_time_limit(0);

        Log::info("=== Début Job Loading MMG [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable.");
            return;
        }

        try {
            // ✅ 1. Configuration de la connexion dynamique avant tout traitement BDD
            $oracleService->configureConnection();

            $jobModel->update(['status' => 'running']);

            $disk = Storage::disk('cdr_storage');
            $files = $disk->files('mmg');

            Log::info("Fichiers trouvés : " . count($files));

            foreach ($files as $filePath) {
                if (!str_ends_with($filePath, '.csv')) continue;

                // 🔴 STOP entre fichiers
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job {$this->jobId} stoppé.");
                    return;
                }

                $fileFullPath = $disk->path($filePath);
                $handle = fopen($fileFullPath, 'r');

                if (!$handle) {
                    Log::error("Impossible d'ouvrir : {$filePath}");
                    continue;
                }

                $header = fgetcsv($handle, 0, ",");
                $batch = [];
                $lineNumber = 0;

                Log::info("Traitement fichier : {$filePath}");

                while (($line = fgetcsv($handle, 0, ",")) !== false) {
                    // 🔴 STOP pendant lecture
                    $jobModel->refresh();
                    if ($jobModel->status !== 'running') {
                        fclose($handle);
                        return;
                    }

                    $lineNumber++;
                    if (count($line) != count($header)) continue;

                    $row = [];
                    foreach ($line as $i => $value) {
                        $row[$header[$i]] = $value;
                    }
                    $batch[] = $row;

                    if (count($batch) >= $this->batchSize) {
                        // ✅ Utilisation de la connexion dynamique
                        DB::connection('oracle_dynamic')->table('RA_T_MMG_TMP')->insert($batch);
                        $batch = [];
                    }
                }

                if (!empty($batch)) {
                    // ✅ Utilisation de la connexion dynamique
                    DB::connection('oracle_dynamic')->table('RA_T_MMG_TMP')->insert($batch);
                }

                fclose($handle);

                // ✅ INSERT Oracle final via connexion dynamique
                DB::connection('oracle_dynamic')->statement("
                    INSERT INTO RA_T_MMG_CDR_DETAIL (
                        NE, A_MSISDN, B_MSISDN, START_DATE, START_HOUR, 
                        EVENT_TYPE, EVENT_TYPE_ORIG, CALL_TYPE, EVENT_STATUS, 
                        SUBSCRIBER_TYPE, SERVICE_TYPE, ORIG_START_TIME
                    )
                    SELECT 
                        NE, A_MSISDN, B_MSISDN,
                        CASE 
                            WHEN REGEXP_LIKE(SUBSTR(ORIG_START_TIME,1,8),'^[0-9]{8}$') 
                            THEN TO_DATE(SUBSTR(ORIG_START_TIME,1,8),'YYYYMMDD') 
                            ELSE NULL 
                        END,
                        CASE 
                            WHEN REGEXP_LIKE(SUBSTR(ORIG_START_TIME,9,2),'^[0-9]{2}$') 
                            THEN TO_NUMBER(SUBSTR(ORIG_START_TIME,9,2)) 
                            ELSE NULL 
                        END,
                        EVENT_TYPE, EVENT_TYPE_ORIG, CALL_TYPE, EVENT_STATUS, 
                        SUBSCRIBER_TYPE, SERVICE_TYPE, ORIG_START_TIME
                    FROM RA_T_MMG_TMP
                    WHERE A_MSISDN IS NOT NULL AND B_MSISDN IS NOT NULL
                ");

                // ✅ Truncate via connexion dynamique
                DB::connection('oracle_dynamic')->statement("TRUNCATE TABLE RA_T_MMG_TMP");

                // Déplacement fichier
                $disk->move($filePath, 'mmg/processed/' . basename($filePath));
                Log::info("Fichier traité et déplacé.");
            }

            // ✅ FIN NORMALE
            if ($jobModel->status === 'running') {
                $jobModel->update(['status' => 'success', 'updated_at' => now()]);
            }

        } catch (\Exception $e) {
            if ($jobModel) {
                $jobModel->update(['status' => 'failed', 'updated_at' => now()]);
            }
            Log::error("Erreur Job MMG : " . $e->getMessage());
        }
    }
}