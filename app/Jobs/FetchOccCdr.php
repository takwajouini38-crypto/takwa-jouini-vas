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

class FetchOccCdr implements ShouldQueue
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

        Log::info("=== START FETCH OCC [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job introuvable");
            return;
        }

        try {
            $sourceFtp = Storage::disk('ftp_local');
            $localFtp  = Storage::disk('cdr_storage');

            $files = $sourceFtp->files('occ');

            Log::info("Nombre de fichiers OCC : " . count($files));

            foreach ($files as $filePath) {

                // 🔴 STOP CHECK AVANT CHAQUE FICHIER
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job OCC stoppé avant traitement fichier");
                    return;
                }

                if (!str_ends_with($filePath, '.csv')) continue;

                $filename = basename($filePath);

                Log::info("Traitement fichier OCC : {$filename}");

                // 🔴 STOP CHECK AVANT DOWNLOAD
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job OCC stoppé avant téléchargement");
                    return;
                }

                $content = $sourceFtp->get($filePath);

                // 🔴 STOP CHECK APRÈS DOWNLOAD
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job OCC stoppé après téléchargement");
                    return;
                }

                $localFtp->put('occ/' . $filename, $content);

                // 🔴 STOP CHECK AVANT MOVE
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job OCC stoppé avant déplacement");
                    return;
                }

                $sourceFtp->move($filePath, 'occ/processed/' . $filename);

                // 🔥 améliore réactivité STOP
                usleep(200000);
            }

            // ✅ FIN PROPRE
            $jobModel->refresh();

            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'finished_at' => now()
                ]);

                DB::commit(); // important pour Oracle
                Log::info("=== FETCH OCC SUCCESS ===");
            }

        } catch (\Exception $e) {

            Log::error("Erreur Fetch OCC : " . $e->getMessage());

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