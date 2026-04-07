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
use App\Services\FtpService; // 🔥 Import du service

class FetchMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
    }

    /**
     * Utilisation du FtpService pour récupérer les accès dynamiques de Tunisie Telecom
     */
   public function handle(FtpService $ftpService)
{
    set_time_limit(0);
    Log::info("=== START FETCH MMG DIRECT [ID: {$this->jobId}] ===");

    $jobModel = JobTask::find($this->jobId);

    if (!$jobModel) {
        Log::error("Job introuvable");
        return;
    }

    try {
        // ✅ CRUCIAL : On force le statut à 'running' dès que le worker prend le job.
        // C'est ce qui fait passer la ligne en vert dans ton interface au bon moment.
        $jobModel->update(['status' => 'running']);
        
        $localFtp = Storage::disk('cdr_storage');
        $files = $ftpService->listFiles('mmg');

        Log::info("Fichiers détectés sur le serveur FTP : " . count($files));

        foreach ($files as $filePath) {
            // 🔴 CHECK STOP : Rafraîchir l'état depuis Oracle
            $jobModel->refresh();
            if ($jobModel->status !== 'running') {
                Log::warning("Job {$this->jobId} stoppé ou mis en pause par l'administrateur");
                return; 
            }

            if (!str_ends_with($filePath, '.csv')) continue;

            $filename = basename($filePath);
            Log::info("Téléchargement de : {$filename}");

            $tempStream = fopen('php://temp', 'r+');
            $conn = $ftpService->connect();
            
            if (ftp_fget($conn, $tempStream, $filePath, FTP_BINARY)) {
                rewind($tempStream);
                $localFtp->put('mmg/' . $filename, $tempStream);
                fclose($tempStream);
                ftp_close($conn);

                // Archivage sur le FTP distant
                $ftpService->move($filePath, 'mmg/processed/' . $filename);
            } else {
                fclose($tempStream);
                if(is_resource($conn)) ftp_close($conn);
                Log::error("Échec du téléchargement : {$filename}");
            }

            usleep(200000); 
        }

        // ✅ FIN DU PROCESSUS : Passage en success
        $jobModel->update([
            'status' => 'success',
            'updated_at' => now() // Utilise updated_at car finished_at n'existe pas dans ta table
        ]);

        Log::info("=== FETCH MMG SUCCESS [ID: {$this->jobId}] ===");

    } catch (\Exception $e) {
        Log::error("Erreur Fetch MMG : " . $e->getMessage());
        $jobModel->update(['status' => 'failed', 'updated_at' => now()]);
    }
}
}