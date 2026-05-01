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

class AggregateOccCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
        $this->onQueue('etl');
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

            // ✅ Passage en 'running'
            $jobModel->update(['status' => 'running']);

            // ✅ 2. Vérifier s'il y a des données à traiter dans DETAIL
            $hasData = DB::connection('oracle_dynamic')->table('RA_T_OCC_CDR_DETAIL')->exists();

            if (!$hasData) {
                Log::info("Aucune donnée dans DETAIL OCC. On garde les données actuelles de AGG.");
                $jobModel->update(['status' => 'success']);
                return;
            }

            // 🔴 CHECK AVANT MERGE
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job {$this->jobId} stoppé avant MERGE");
                return;
            }

            // ✅ 3. Lancement du MERGE pour OCC (Gère CDR_COUNT et CHARGE_AMOUNT)
            DB::connection('oracle_dynamic')->statement("
                MERGE INTO RA_T_OCC_AGG target
                USING (
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
                        B_MSISDN, START_DATE, START_HOUR, CALL_TYPE, 
                        EVENT_TYPE, SUBSCRIBER_TYPE, KEYWORD
                ) source
               ON (
             target.B_MSISDN = source.B_MSISDN AND
             target.START_DATE = source.START_DATE AND
             target.START_HOUR = source.START_HOUR AND
             target.CALL_TYPE = source.CALL_TYPE AND
             target.EVENT_TYPE = source.EVENT_TYPE AND
             target.KEYWORD = source.KEYWORD AND
             target.SUBSCRIBER_TYPE = source.SUBSCRIBER_TYPE 
              )
                WHEN MATCHED THEN
                    UPDATE SET 
                        target.CDR_COUNT = source.CDR_COUNT,
                        target.CHARGE_AMOUNT = source.CHARGE_AMOUNT
                WHEN NOT MATCHED THEN
                    INSERT (
                        B_MSISDN, START_DATE, START_HOUR, CALL_TYPE, 
                        EVENT_TYPE, SUBSCRIBER_TYPE, KEYWORD, CDR_COUNT, CHARGE_AMOUNT
                    )
                    VALUES (
                        source.B_MSISDN, source.START_DATE, source.START_HOUR, source.CALL_TYPE, 
                        source.EVENT_TYPE, source.SUBSCRIBER_TYPE, source.KEYWORD, source.CDR_COUNT, source.CHARGE_AMOUNT
                    )
            ");

            Log::info("Opération MERGE OCC terminée avec succès.");

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