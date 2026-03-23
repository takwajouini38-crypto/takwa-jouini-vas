<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;

class LoadMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;
    protected $batchSize = 1000;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
    }

    public function handle()
    {
        set_time_limit(0);

        Log::info("Load MMG - Start job {$this->jobId}");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable: {$this->jobId}");
            return;
        }

        try {

            $disk = Storage::disk('cdr_storage');
            $files = $disk->files('mmg');

            Log::info("Nombre de fichiers MMG: " . count($files));

            foreach ($files as $filePath) {

                $jobModel->refresh();
                if ($jobModel->status !== 'running') break;

                if (!str_ends_with($filePath, '.csv')) continue;

                $fileFullPath = $disk->path($filePath);
                $handle = fopen($fileFullPath, 'r');

                if (!$handle) {
                    Log::error("Impossible d'ouvrir le fichier: {$filePath}");
                    continue;
                }

                $header = fgetcsv($handle, 0, ",");
                if (!$header) {
                    fclose($handle);
                    continue;
                }

                $batch = [];
                $lineNumber = 0;

                while (($line = fgetcsv($handle, 0, ",")) !== false) {

                    $lineNumber++;

                    if (count($line) != count($header)) continue;

                    $row = [];
                    foreach ($line as $i => $value) {
                        $row[$header[$i]] = $value;
                    }

                    $batch[] = $row;

                    if (count($batch) >= $this->batchSize) {
                        DB::table('RA_T_MMG_TMP')->insert($batch);
                        $batch = [];
                    }
                }

                if (!empty($batch)) {
                    DB::table('RA_T_MMG_TMP')->insert($batch);
                }

                fclose($handle);

                Log::info("Fichier {$filePath} traité: {$lineNumber} lignes");

                DB::statement("
                    INSERT INTO RA_T_MMG_CDR_DETAIL (
                        NE,
                        A_MSISDN,
                        B_MSISDN,
                        START_DATE,
                        START_HOUR,
                        EVENT_TYPE,
                        EVENT_TYPE_ORIG,
                        CALL_TYPE,
                        EVENT_STATUS,
                        SUBSCRIBER_TYPE,
                        SERVICE_TYPE,
                        ORIG_START_TIME
                    )
                    SELECT
                        NE,
                        A_MSISDN,
                        B_MSISDN,
                        CASE
                            WHEN REGEXP_LIKE(SUBSTR(ORIG_START_TIME,1,8),'^[0-9]{8}$')
                            THEN TO_DATE(SUBSTR(ORIG_START_TIME,1,8),'YYYYMMDD')
                            ELSE NULL
                        END,
                        CASE
                            WHEN REGEXP_LIKE(SUBSTR(ORIG_START_TIME,9,2),'^[0-9]{2}$')
                            THEN TO_NUMBER(SUBSTR(ORIG_START_TIME,9,2))
                            ELSE NULL
                        END,
                        EVENT_TYPE,
                        EVENT_TYPE_ORIG,
                        CALL_TYPE,
                        EVENT_STATUS,
                        SUBSCRIBER_TYPE,
                        SERVICE_TYPE,
                        ORIG_START_TIME
                    FROM RA_T_MMG_TMP
                    WHERE A_MSISDN IS NOT NULL
                      AND B_MSISDN IS NOT NULL
                ");

                DB::statement("TRUNCATE TABLE RA_T_MMG_TMP");

                $disk->move($filePath, 'mmg/processed/' . basename($filePath));
            }

            // ✅ FIN OK
            $jobModel->update([
                'status' => 'stopped',
                'finished_at' => now()
            ]);

            Log::info("Load MMG - Fin job {$this->jobId}");

        } catch (\Exception $e) {

            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Load MMG : " . $e->getMessage());
        }
    }
}