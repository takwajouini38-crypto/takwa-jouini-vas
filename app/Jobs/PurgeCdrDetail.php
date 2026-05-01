<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use App\Models\JobTask;
use App\Services\OracleConnectorService; // ✅ Import du service

class PurgeCdrDetail implements ShouldQueue
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

        Log::info("=== START PURGE [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable");
            return;
        }

        try {
            // ✅ 1. Configuration de la connexion dynamique Oracle
            $oracleService->configureConnection();

            // ✅ 2. Forcer le statut à 'running' pour l'interface
            $jobModel->update(['status' => 'running']);

            $disk = Storage::disk('cdr_storage');

            // =========================
            // 🔴 PARTIE 1 : DISK MMG
            // =========================
            $mmgFiles = $disk->files('mmg/processed');

            foreach ($mmgFiles as $file) {
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Purge stoppée pendant MMG files");
                    return;
                }

                $disk->delete($file);
                usleep(100000);
            }

            Log::info("MMG processed supprimé");

            // =========================
            // 🔴 PARTIE 2 : DISK OCC
            // =========================
            $occFiles = $disk->files('occ/processed');

            foreach ($occFiles as $file) {
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Purge stoppée pendant OCC files");
                    return;
                }

                $disk->delete($file);
                usleep(100000);
            }

            Log::info("OCC processed supprimé");

            // =========================
            // 🔴 PARTIE 3 : DB MMG (Connexion Dynamique)
            // =========================
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Purge stoppée avant DELETE MMG");
                return;
            }
/*conserve toujours les 30 derniers jours d'historique par rapport à la dernière donnée chargée*/
               $deletedMmg = DB::connection('oracle_dynamic')->affectingStatement("
                DELETE FROM RA_T_MMG_CDR_DETAIL 
                WHERE START_DATE < (SELECT MAX(START_DATE) - 30 FROM RA_T_MMG_CDR_DETAIL)");


           /* $deletedMmg = DB::connection('oracle_dynamic')->affectingStatement("
                DELETE FROM RA_T_MMG_CDR_DETAIL 
                WHERE START_DATE < SYSDATE - 30
            ");*/

            // =========================
            // 🔴 PARTIE 4 : DB OCC (Connexion Dynamique)
            // =========================
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Purge stoppée avant DELETE OCC");
                return;
            }
     
            /*conserve toujours les 30 derniers jours d'historique par rapport à la dernière donnée chargée*/
               $deletedOcc = DB::connection('oracle_dynamic')->affectingStatement("
                DELETE FROM  RA_T_OCC_CDR_DETAIL 
                WHERE START_DATE < (SELECT MAX(START_DATE) - 30 FROM RA_T_OCC_CDR_DETAIL)");


           /* $deletedOcc = DB::connection('oracle_dynamic')->affectingStatement("
                DELETE FROM RA_T_OCC_CDR_DETAIL 
                WHERE START_DATE < SYSDATE - 30
            ");*/

            Log::info("DB purge : MMG=$deletedMmg OCC=$deletedOcc");

            // =========================
            // ✅ FIN PROPRE
            // =========================
            $jobModel->refresh();

            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'updated_at' => now() // Correction : utiliser updated_at pour la cohérence
                ]);
            }

            Log::info("=== END PURGE SUCCESS ===");

        } catch (\Exception $e) {
            if ($jobModel) {
                $jobModel->update([
                    'status' => 'failed',
                    'updated_at' => now()
                ]);
            }
            Log::error("Erreur purge [ID: {$this->jobId}] : " . $e->getMessage());
        }
    }
}