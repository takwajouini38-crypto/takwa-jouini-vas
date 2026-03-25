<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\JobTask;

class FetchMmgCdr implements ShouldQueue
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

        Log::info("=== START FETCH MMG [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable");
            return;
        }

        try {
            $sourceFtp = Storage::disk('ftp_local');
            $localFtp  = Storage::disk('cdr_storage');

            $files = $sourceFtp->files('mmg');

            Log::info("Nombre de fichiers trouvés : " . count($files));

            foreach ($files as $filePath) {

                // 🔴 STOP CHECK AVANT CHAQUE FICHIER
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job stoppé avant traitement fichier");
                    return;
                }

                if (!str_ends_with($filePath, '.csv')) continue;

                $filename = basename($filePath);

                Log::info("Traitement fichier : {$filename}");

                // 🔴 STOP CHECK AVANT DOWNLOAD
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job stoppé avant téléchargement");
                    return;
                }

                $content = $sourceFtp->get($filePath);

                // 🔴 STOP CHECK APRÈS DOWNLOAD
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job stoppé après téléchargement");
                    return;
                }

                $localFtp->put('mmg/' . $filename, $content);

                // 🔴 STOP CHECK AVANT MOVE
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job stoppé avant déplacement fichier");
                    return;
                }

                $sourceFtp->move($filePath, 'mmg/processed/' . $filename);

                // 🔥 améliore réactivité du STOP
                usleep(200000); // 0.2 sec
            }

            // ✅ FIN PROPRE
            $jobModel->refresh();

            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'finished_at' => now()
                ]);

                DB::commit(); // utile pour Oracle
                Log::info("=== FETCH MMG SUCCESS ===");
            }

        } catch (\Exception $e) {

            Log::error("Erreur Fetch MMG : " . $e->getMessage());

            if ($jobModel) {
                $jobModel->update([
                    'status' => 'failed',
                    'finished_at' => now()
                ]);

                DB::commit();
            }
        }
    }
}