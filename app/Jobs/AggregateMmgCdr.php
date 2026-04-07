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
use App\Services\OracleConnectorService; // ✅ Import du service

class AggregateMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
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
            // ✅ 1. Configuration de la connexion dynamique (oracle_dynamic)
            $oracleService->configureConnection();

            // ✅ Passage en 'running'
            $jobModel->update(['status' => 'running']);

            // 🔴 CHECK AVANT TRUNCATE
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job {$this->jobId} stoppé avant TRUNCATE");
                return;
            }

            // ✅ TRUNCATE via connexion dynamique
            DB::connection('oracle_dynamic')->statement("TRUNCATE TABLE RA_T_MMG_AGG");
            Log::info("Table RA_T_MMG_AGG vidée.");

            // 🔴 CHECK AVANT INSERT
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job {$this->jobId} stoppé avant INSERT");
                return;
            }

            // ✅ INSERT (Agrégation BI) via connexion dynamique
            DB::connection('oracle_dynamic')->statement("
                INSERT INTO RA_T_MMG_AGG
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
                    B_MSISDN,
                    START_DATE,
                    START_HOUR,
                    EVENT_TYPE,
                    CALL_TYPE,
                    EVENT_STATUS,
                    SUBSCRIBER_TYPE,
                    SERVICE_TYPE
            ");

            Log::info("Agrégation terminée dans RA_T_MMG_AGG.");

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