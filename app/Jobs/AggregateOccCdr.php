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

class AggregateOccCdr implements ShouldQueue
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

        Log::info("=== START AGGREGATE OCC [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable");
            return;
        }

        try {

            // 🔴 CHECK AVANT TRUNCATE
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job stoppé avant TRUNCATE");
                return;
            }

            DB::statement("TRUNCATE TABLE RA_T_OCC_AGG");

            // 🔴 CHECK AVANT INSERT
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job stoppé avant INSERT");
                return;
            }

            DB::statement("
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

            // ✅ FIN PROPRE
            $jobModel->refresh();

            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'finished_at' => now()
                ]);
            }

            Log::info("=== END AGGREGATE OCC SUCCESS ===");

        } catch (\Exception $e) {

            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Aggregate OCC : " . $e->getMessage());
        }
    }
}