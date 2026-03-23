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
        Log::info("Aggregate MMG - Start job {$this->jobId}");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) return;

        try {

            DB::statement("TRUNCATE TABLE RA_T_MMG_AGG");

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

            $jobModel->update([
                'status' => 'stopped',
                'finished_at' => now()
            ]);

            Log::info("Aggregate MMG - Fin job {$this->jobId}");

        } catch (\Exception $e) {

            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Aggregate MMG : " . $e->getMessage());
        }
    }
}