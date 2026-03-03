<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class AggregateMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
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
    }
}