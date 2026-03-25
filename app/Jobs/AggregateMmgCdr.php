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

class AggregateMmgCdr implements ShouldQueue
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

        Log::info("=== START AGGREGATE MMG [ID: {$this->jobId}] ===");

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

            DB::statement("TRUNCATE TABLE RA_T_MMG_AGG");

            // 🔴 CHECK AVANT INSERT
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job stoppé avant INSERT");
                return;
            }

            DB::statement("
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

            // ✅ FIN PROPRE
            $jobModel->refresh();

            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'finished_at' => now()
                ]);
            }

            Log::info("=== END AGGREGATE MMG SUCCESS ===");

        } catch (\Exception $e) {

            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Aggregate MMG : " . $e->getMessage());
        }
    }
}