<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use App\Models\JobTask; // Import du modèle Job
use Illuminate\Support\Facades\Log;

class LoadMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId; // ID du job dans la table jobs

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
    }

    public function handle()
    {
        Log::info('LoadMmgCdr - Début du job pour job ID : ' . $this->jobId); // ← Log
        // Récupérer le modèle Job pour suivre l'état
        $jobModel = JobTask::find($this->jobId);
        if (!$jobModel) {
            Log::error('LoadMmgCdr - Job introuvable : ' . $this->jobId); // ← Log
            return; // Job introuvable, on arrête
        }

        $disk = Storage::disk('cdr_storage');
        $files = $disk->files('mmg');
        Log::info('LoadMmgCdr - Nombre de fichiers trouvés : ' . count($files)); // ← Log


        foreach ($files as $filePath) {
            // Vérification avant de traiter le fichier
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::info('LoadMmgCdr - Arrêt demandé, interruption avant fichier : ' . $filePath); 
                break; // Arrêt demandé
            }

            if (!str_ends_with($filePath, '.csv')) {
                 Log::info('LoadMmgCdr - Fichier ignoré (pas CSV) : ' . $filePath); // ← Log
                continue;
            }
                Log::info('LoadMmgCdr - Traitement du fichier : ' . $filePath); // ← Log
            $content = $disk->get($filePath);
            $lines = explode("\n", $content);
            Log::info('LoadMmgCdr - Nombre de lignes dans le fichier : ' . count($lines)); // ← Log

            $batch = [];

            foreach ($lines as $lineRaw) {
                $line = str_getcsv($lineRaw, ",");

                if (count($line) < 12) {
                    continue;
                }

                $batch[] = [
                    "NE" => $line[0] ?? null,
                    "A_MSISDN" => $line[1] ?? null,
                    "B_MSISDN" => $line[2] ?? null,
                    "PROC_DATE" => $line[3] ?? null,
                    "PROC_HOUR" => $line[4] ?? null,
                    "EVENT_TYPE" => $line[5] ?? null,
                    "EVENT_TYPE_ORIG" => $line[6] ?? null,
                    "CALL_TYPE" => $line[7] ?? null,
                    "EVENT_STATUS" => $line[8] ?? null,
                    "SUBSCRIBER_TYPE" => $line[9] ?? null,
                    "SERVICE_TYPE" => $line[10] ?? null,
                    "ORIG_START_TIME" => $line[11] ?? null,
                ];

                if (count($batch) == 500) {
                    DB::table("RA_T_TMP_MMG")->insert($batch);
                     Log::info('LoadMmgCdr - Lot de 500 lignes inséré'); // ← Log
                    $batch = [];

                    // Vérification après chaque lot de 500 lignes
                    $jobModel->refresh();
                    if ($jobModel->status !== 'running') {
                         Log::info('LoadMmgCdr - Arrêt demandé pendant l\'insertion'); // ← Log
                        break 2; // Sort des deux boucles (lignes et fichiers)
                    }
                }
            }

            // Insertion des dernières lignes
            if (!empty($batch)) {
                DB::table("RA_T_TMP_MMG")->insert($batch);
                Log::info('LoadMmgCdr - Dernier lot inséré (' . count($batch) . ' lignes)'); // ← Lo
            }

            // Vérification après l'insertion dans TMP
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                break;
            }

            // =========================
            // TMP → DET_SIMPLE (TES RÈGLES)
            // =========================
            DB::statement("
                INSERT INTO Ra_T_MMG_CDR_DET_SIMPLE (
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
                    'MMG' AS NE,
                    '216' || TRUNC(DBMS_RANDOM.VALUE(10000000,99999999)) AS A_MSISDN,
                    2168000 AS B_MSISDN,
                    TO_DATE('20260121','YYYYMMDD') AS START_DATE,
                    0 AS START_HOUR,
                    74 AS EVENT_TYPE,
                    'SMS_mSOring' AS EVENT_TYPE_ORIG,
                    'VAS' AS CALL_TYPE,
                    'Success' AS EVENT_STATUS,
                    CASE
                        WHEN TRUNC(DBMS_RANDOM.VALUE(1,3)) = 1 THEN 'PREPAID'
                        ELSE 'HYB'
                    END AS SUBSCRIBER_TYPE,
                    CASE TRUNC(DBMS_RANDOM.VALUE(1,10))
                        WHEN 1 THEN 'rrt1'
                        WHEN 2 THEN 'cf'
                        WHEN 3 THEN 'ww'
                        WHEN 4 THEN 'cpr'
                        WHEN 5 THEN 'cpt'
                        WHEN 6 THEN 'ab1'
                        WHEN 7 THEN '9is'
                        WHEN 8 THEN 'tj'
                        WHEN 9 THEN 'gm'
                    END AS SERVICE_TYPE,
                    2026012100 AS ORIG_START_TIME
                FROM RA_T_TMP_MMG
                WHERE A_MSISDN IS NOT NULL
                  AND B_MSISDN IS NOT NULL
                  AND PROC_DATE IS NOT NULL
            ");

            // Vérification après l'insertion dans DET_SIMPLE
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                break;
            }

            // Nettoyage TMP
            DB::statement("TRUNCATE TABLE RA_T_TMP_MMG");

            // Déplacement du fichier traité
            $disk->move(
                $filePath,
                'mmg/processed/' . basename($filePath)
            );
        }

        // Fin du job : le statut sera mis à jour par la commande appelante
    }
}