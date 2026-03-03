<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class LoadOccCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $disk = Storage::disk('ftp_local');
        $files = $disk->files('occ');

        foreach ($files as $filePath) {

            if (!str_ends_with($filePath, '.csv')) continue;

            $content = $disk->get($filePath);
            $lines = explode("\n", $content);
            $batch = [];

            foreach ($lines as $lineRaw) {
                $line = str_getcsv($lineRaw, ",");

                if (count($line) < 57) continue;

                $batch[] = [
                    "B_DATASOURCE" => $line[6] ?? null,
                    "A_MSISDN" => $line[3] ?? null,
                    "B_MSISDN" => $line[8] ?? null,
                    "START_DATE_TIME_HOME" => $line[54] ?? null,
                    "START_TIME" => $line[55] ?? null,
                    "APN" => $line[1] ?? null,
                    "CALL_TYPE" => $line[11] ?? null,
                    "EVENT_TYPE" => $line[27] ?? null,
                    "CHARGE_AMOUNT_ORIG" => $line[17] ?? null,
                    "SERVICE_ID" => $line[49] ?? null,
                    "SUBSCRIBER_TYPE" => $line[56] ?? null,
                    "ROAMING_TYPE" => $line[47] ?? null,
                    "PARTNER" => $line[36] ?? null,
                    "DATA_VOLUME" => $line[20] ?? null,
                    "EVENT_DURATION" => $line[25] ?? null,
                    "CHARGE_AMNT_STEP" => $line[16] ?? null,
                    "FILTER_CODE" => $line[30] ?? null,
                    "ORIG_START_TIME" => $line[34] ?? null,
                ];

                if (count($batch) == 500) {
                    DB::table("RA_T_TMP_OCC")->insert($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                DB::table("RA_T_TMP_OCC")->insert($batch);
            }

            // Insert temporaire vers table DETAIL
            DB::statement("
                INSERT INTO RA_T_OCC_CDR_DETAIL (
                    DATASOURCE,
                    A_MSISDN,
                    B_MSISDN,
                    START_DATE,
                    START_HOUR,
                    APN,
                    CALL_TYPE,
                    EVENT_TYPE,
                    CHARGING_ID,
                    SERVICE_ID,
                    SUBSCRIBER_TYPE,
                    ROAMING_TYPE,
                    PARTNER,
                    EVENT_COUNT,
                    DATA_VOLUME,
                    EVENT_DURATION,
                    CHARGE_AMOUNT,
                    FILTER_CODE,
                    KEYWORD,
                    ORIG_START_TIME,
                    DA_AMOUNT_CALC,
                    MA_AMNT_CALC,
                    FLEX_FLD1,
                    FLEX_FLD2,
                    FLEX_FLD3
                )
                SELECT
                    B_DATASOURCE,
                    TRIM(A_MSISDN),
                    TRIM(B_MSISDN),
                    TO_DATE(SUBSTR(START_DATE_TIME_HOME,1,8),'YYYYMMDD'),
                    CASE 
                        WHEN REGEXP_LIKE(SUBSTR(START_TIME,1,2),'^[0-9]{2}')
                        THEN TO_NUMBER(SUBSTR(START_TIME,1,2))
                        ELSE 0
                    END,
                    APN,
                    CALL_TYPE,
                    74 AS EVENT_TYPE,
                    0 AS CHARGING_ID,
                    '_N' AS SERVICE_ID,
                    TRIM(SUBSCRIBER_TYPE),
                    'HOME' AS ROAMING_TYPE,
                    'TUNTT' AS PARTNER,
                    1 AS EVENT_COUNT,
                    0 AS DATA_VOLUME,
                    0 AS EVENT_DURATION,
                    TO_NUMBER(REPLACE(CHARGE_AMOUNT_ORIG, ',', '.')),
                    '_UN' AS FILTER_CODE,
                    TRIM(SERVICE_ID) AS KEYWORD,
                    TRIM(ORIG_START_TIME),
                    0 AS DA_AMOUNT_CALC,
                    TO_NUMBER(REPLACE(CHARGE_AMOUNT_ORIG, ',', '.')) AS MA_AMNT_CALC,
                    0 AS FLEX_FLD1,
                    0 AS FLEX_FLD2,
                    0 AS FLEX_FLD3
                FROM RA_T_TMP_OCC
                WHERE B_DATASOURCE IS NOT NULL
                  AND A_MSISDN IS NOT NULL
                  AND START_DATE_TIME_HOME IS NOT NULL
                  AND REGEXP_LIKE(START_DATE_TIME_HOME, '^[0-9]{8}')
            ");

            DB::statement("TRUNCATE TABLE RA_T_TMP_OCC");

            $disk->move($filePath, 'occ/processed/' . basename($filePath));
        }
    }
}