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

class LoadOccCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;
    protected $batchSize = 1000;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
    }

    /**
     * Injection du service OracleConnectorService pour la connexion dynamique.
     */
    public function handle(OracleConnectorService $oracleService)
    {
        set_time_limit(0);

        Log::info("Load OCC - Start job {$this->jobId}");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable: {$this->jobId}");
            return;
        }

        try {
            // ✅ 1. Initialisation de la connexion dynamique via ton service
            $oracleService->configureConnection();

            // ✅ Passage en 'running' pour activer l'interface
            $jobModel->update(['status' => 'running']);

            $disk = Storage::disk('cdr_storage');
            $files = $disk->files('occ');
            Log::info("Nombre de fichiers trouvés : " . count($files));

            foreach ($files as $filePath) {

                // 🔴 STOP CHECK : Avant chaque fichier
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job {$this->jobId} stoppé manuellement.");
                    return;
                }

                if (!str_ends_with($filePath, '.csv')) continue;

                $fileFullPath = $disk->path($filePath);
                $handle = fopen($fileFullPath, 'r');

                if (!$handle) continue;

                $header = fgetcsv($handle, 0, ",");
                if (!$header) {
                    fclose($handle);
                    continue;
                }

                $batch = [];

                while (($line = fgetcsv($handle, 0, ",")) !== false) {
                    // 🔴 STOP CHECK : Pendant la lecture des lignes
                    $jobModel->refresh();
                    if ($jobModel->status !== 'running') {
                        fclose($handle);
                        return;
                    }

                    if (count($line) != count($header)) continue;

                    $row = [];
                    foreach ($line as $i => $value) {
                        $row[$header[$i]] = $value;
                    }
                    $batch[] = $row;

                    if (count($batch) >= $this->batchSize) {
                        // ✅ Insertion via connexion dynamique
                        DB::connection('oracle_dynamic')->table('RA_T_TMP_OCC')->insert($batch);
                        $batch = [];
                    }

                    usleep(100000);
                }

                if (!empty($batch)) {
                    // ✅ Insertion du dernier batch via connexion dynamique
                    DB::connection('oracle_dynamic')->table('RA_T_TMP_OCC')->insert($batch);
                }

                fclose($handle);

                // 🔴 STOP CHECK : Avant le transfert final dans la table DETAIL
                $jobModel->refresh();
                if ($jobModel->status !== 'running') return;

                // ✅ INSERT Oracle final (Connexion dynamique)
                DB::connection('oracle_dynamic')->statement("
                    INSERT INTO RA_T_OCC_CDR_DETAIL (
                        DATASOURCE, A_MSISDN, B_MSISDN, START_DATE, START_HOUR, APN, CALL_TYPE,
                        EVENT_TYPE, SUBSCRIBER_TYPE, ROAMING_TYPE, PARTNER, CHARGE_AMOUNT, KEYWORD, ORIG_START_TIME
                    )
                    SELECT
                        B_DATASOURCE, A_MSISDN, B_MSISDN,
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
                        APN, CALL_TYPE, EVENT_TYPE, SUBSCRIBER_TYPE, ROAMING_TYPE, PARTNER,
                        CASE
                            WHEN REGEXP_LIKE(CHARGE_AMOUNT_ORIG,'^[0-9]+(\.[0-9]+)?$')
                            THEN ROUND(TO_NUMBER(CHARGE_AMOUNT_ORIG),2)
                            ELSE NULL
                        END,
                        SERVICE_ID, ORIG_START_TIME
                    FROM RA_T_TMP_OCC
                    WHERE A_MSISDN IS NOT NULL AND B_MSISDN IS NOT NULL
                ");

                // ✅ Nettoyage (Connexion dynamique)
                DB::connection('oracle_dynamic')->statement("TRUNCATE TABLE RA_T_TMP_OCC");

                // Déplacement du fichier vers processed
                $disk->move($filePath, 'occ/processed/' . basename($filePath));
            }

            // ✅ Marquer comme terminé avec succès
            $jobModel->refresh();
            if ($jobModel->status === 'running') {
                $jobModel->update(['status' => 'success', 'updated_at' => now()]);
            }

            Log::info("Load OCC - Fin SUCCESS job {$this->jobId}");

        } catch (\Exception $e) {
            if ($jobModel) {
                $jobModel->update(['status' => 'failed', 'updated_at' => now()]);
            }
            Log::error("Erreur Load OCC : " . $e->getMessage());
        }
    }
}