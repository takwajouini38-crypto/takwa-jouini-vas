<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;
use App\Services\OracleConnectorService;

class AggregateMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
        $this->onQueue('etl');
    }

    /**
     * handle() avec injection du service de connexion.
     */
    public function handle(OracleConnectorService $oracleService)
    {
        set_time_limit(0);

        Log::info("=== START AGGREGATE MMG [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable");
            return;
        }

        try {
            // ✅ 1. Configuration de la connexion dynamique
            $oracleService->configureConnection();

            // ✅ Passage en 'running'
            $jobModel->update(['status' => 'running']);

            // ✅ 2. Vérifier s'il y a des données à traiter dans la table DETAIL
            $hasData = DB::connection('oracle_dynamic')->table('RA_T_MMG_CDR_DETAIL')->exists();

            if (!$hasData) {
                Log::info("Aucune donnée dans DETAIL. On garde les données actuelles de AGG.");
                $jobModel->update(['status' => 'success']);
                return;
            }

            // 🔴 CHECK AVANT MERGE
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job {$this->jobId} stoppé avant MERGE");
                return;
            }

            // ✅ 3. Lancement du MERGE (Remplace INSERT et gère les doublons)
            DB::connection('oracle_dynamic')->statement("
                MERGE INTO RA_T_MMG_AGG target
                USING (
                    SELECT
                        B_MSISDN,
                        START_DATE,
                        START_HOUR,
                        EVENT_TYPE,
                        CALL_TYPE,
                        EVENT_STATUS,
                        SUBSCRIBER_TYPE,
                        SERVICE_TYPE,
                        COUNT(*) AS CDR_COUNT
                    FROM RA_T_MMG_CDR_DETAIL
                    GROUP BY
                        B_MSISDN, START_DATE, START_HOUR, EVENT_TYPE,
                        CALL_TYPE, EVENT_STATUS, SUBSCRIBER_TYPE, SERVICE_TYPE
                ) source
               ON (
               target.B_MSISDN = source.B_MSISDN AND
               target.START_DATE = source.START_DATE AND
               target.START_HOUR = source.START_HOUR AND
               target.EVENT_TYPE = source.EVENT_TYPE AND
               target.CALL_TYPE = source.CALL_TYPE AND
               target.SERVICE_TYPE = source.SERVICE_TYPE AND
               target.EVENT_STATUS = source.EVENT_STATUS AND 
                target.SUBSCRIBER_TYPE = source.SUBSCRIBER_TYPE 
                )
                WHEN MATCHED THEN
                    UPDATE SET target.CDR_COUNT = source.CDR_COUNT
                WHEN NOT MATCHED THEN
                    INSERT (
                        B_MSISDN, START_DATE, START_HOUR, EVENT_TYPE, 
                        CALL_TYPE, EVENT_STATUS, SUBSCRIBER_TYPE, SERVICE_TYPE, CDR_COUNT
                    )
                    VALUES (
                        source.B_MSISDN, source.START_DATE, source.START_HOUR, source.EVENT_TYPE, 
                        source.CALL_TYPE, source.EVENT_STATUS, source.SUBSCRIBER_TYPE, source.SERVICE_TYPE, source.CDR_COUNT
                    )
            ");

            Log::info("Opération MERGE terminée avec succès dans RA_T_MMG_AGG.");

            // ✅ FIN PROPRE
            $jobModel->refresh();
            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'updated_at' => now() 
                ]);
            }

            Log::info("=== END AGGREGATE MMG SUCCESS [ID: {$this->jobId}] ===");

        } catch (\Exception $e) {
            if ($jobModel) {
                $jobModel->update([
                    'status' => 'failed',
                    'updated_at' => now()
                ]);
            }
            Log::error("Erreur Aggregate MMG [ID: {$this->jobId}] : " . $e->getMessage());
        }
    }
}