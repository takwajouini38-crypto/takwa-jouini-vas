<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class AggregateOccCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        DB::statement("TRUNCATE TABLE RA_T_OCC_AGG");

        DB::statement("
            INSERT INTO RA_T_OCC_AGG
            SELECT
                B_MSISDN, START_DATE, START_HOUR, CALL_TYPE, EVENT_TYPE, SUBSCRIBER_TYPE, KEYWORD , COUNT(*) CDR_COUNT,sum(CHARGE_AMOUNT)  CHARGE_AMOUNT
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
    }
}