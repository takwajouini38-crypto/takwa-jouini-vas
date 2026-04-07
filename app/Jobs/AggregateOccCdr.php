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

class AggregateOccCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
    }

    /**
     * handle() avec injection du service OracleConnectorService.
     */
    public function handle(OracleConnectorService $oracleService)
    {
        set_time_limit(0);

        Log::info("=== START AGGREGATE OCC [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable");
            return;
        }

        try {
            // ✅ 1. Configuration de la connexion dynamique
            $oracleService->configureConnection();

            // ✅ Forcer le statut à 'running'
            $jobModel->update(['status' => 'running']);

            // 🔴 CHECK AVANT TRUNCATE
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job {$this->jobId} stoppé avant TRUNCATE");
                return;
            }

            // ✅ TRUNCATE via connexion dynamique
            DB::connection('oracle_dynamic')->statement("TRUNCATE TABLE RA_T_OCC_AGG");
            Log::info("Table RA_T_OCC_AGG vidée.");

            // 🔴 CHECK AVANT INSERT
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job {$this->jobId} stoppé avant INSERT");
                return;
            }

            // ✅ INSERT (BI Aggregation) via connexion dynamique
            DB::connection('oracle_dynamic')->statement("
                INSERT INTO RA_T_OCC_AGG
                SELECT
                    B_MSISDN,
                    START_DATE,
                    START_HOUR,
                    CALL_TYPE,
                    EVENT_TYPE,
                    SUBSCRIBER_TYPE,
                    KEYWORD,
                    COUNT(*) AS CDR_COUNT,
                    SUM(CHARGE_AMOUNT) AS CHARGE_AMOUNT
                FROM RA_T_OCC_CDR_DETAIL
                GROUP BY
                    B_MSISDN,
                    START_DATE,
                    START_HOUR,
                    CALL_TYPE,
                    EVENT_TYPE,
                    SUBSCRIBER_TYPE,
                    KEYWORD
            ");

            Log::info("Agrégation OCC terminée avec succès.");

            // ✅ FIN PROPRE
            $jobModel->refresh();
            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'updated_at' => now()
                ]);
            }

            Log::info("=== END AGGREGATE OCC SUCCESS [ID: {$this->jobId}] ===");

        } catch (\Exception $e) {
            if ($jobModel) {
                $jobModel->update([
                    'status' => 'failed',
                    'updated_at' => now()
                ]);
            }
            Log::error("Erreur Aggregate OCC [ID: {$this->jobId}] : " . $e->getMessage());
        }
    }
}