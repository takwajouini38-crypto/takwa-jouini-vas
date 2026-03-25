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

class PurgeCdrDetail implements ShouldQueue
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

        Log::info("=== START PURGE [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable");
            return;
        }

        try {
            $disk = Storage::disk('cdr_storage');

            // =========================
            // 🔴 PARTIE 1 : DISK MMG
            // =========================
            $mmgFiles = $disk->files('mmg/processed');

            foreach ($mmgFiles as $file) {

                // 🔴 STOP CHECK
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

                // 🔴 STOP CHECK
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
            // 🔴 PARTIE 3 : DB MMG
            // =========================
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Purge stoppée avant DELETE MMG");
                return;
            }

            $deletedMmg = DB::affectingStatement("
                DELETE FROM RA_T_MMG_CDR_DETAIL 
                WHERE START_DATE < SYSDATE - 30
            ");

            // =========================
            // 🔴 PARTIE 4 : DB OCC
            // =========================
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Purge stoppée avant DELETE OCC");
                return;
            }

            $deletedOcc = DB::affectingStatement("
                DELETE FROM RA_T_OCC_CDR_DETAIL 
                WHERE START_DATE < SYSDATE - 30
            ");

            Log::info("DB purge : MMG=$deletedMmg OCC=$deletedOcc");

            // =========================
            // ✅ FIN PROPRE
            // =========================
            $jobModel->refresh();

            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'finished_at' => now()
                ]);

                DB::commit();
            }

            Log::info("=== END PURGE SUCCESS ===");

        } catch (\Exception $e) {

            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            DB::commit();

            Log::error("Erreur purge : " . $e->getMessage());
        }
    }
}