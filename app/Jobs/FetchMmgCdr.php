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
            // Ton disque local de destination
            $localFtp = Storage::disk('cdr_storage');

            // 1. Lister les fichiers sur le serveur distant (dossier 'mmg')
            $files = $ftpService->listFiles('mmg');

            Log::info("Fichiers détectés sur le serveur FTP : " . count($files));

            foreach ($files as $filePath) {

                // 🔴 CHECK STOP : Vérifie si l'admin a cliqué sur "Stop"
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job stoppé par l'administrateur");
                    return;
                }

                // Filtrage CSV
                if (!str_ends_with($filePath, '.csv')) continue;

                $filename = basename($filePath);
                Log::info("Téléchargement direct de : {$filename}");

                // 2. RÉCUPÉRATION ET STOCKAGE DIRECT
                // On utilise une ressource temporaire en mémoire PHP (php://temp) 
                // pour faire le pont sans créer de fichier physique dans un dossier /temp
                $tempStream = fopen('php://temp', 'r+');
                
                // Connexion et téléchargement vers le flux
                $conn = $ftpService->connect();
                if (ftp_fget($conn, $tempStream, $filePath, FTP_BINARY)) {
                    rewind($tempStream);
                    
                    // Écriture directe dans ton disque cdr_storage
                    $localFtp->put('mmg/' . $filename, $tempStream);
                    fclose($tempStream);
                    ftp_close($conn);

                    Log::info("Fichier stocké directement dans cdr_storage/mmg/");

                    // 3. ARCHIVAGE DISTANT (Move sur le FTP)
                    $ftpService->move($filePath, 'mmg/processed/' . $filename);
                } else {
                    fclose($tempStream);
                    ftp_close($conn);
                    Log::error("Échec du téléchargement pour le fichier : {$filename}");
                }

                // 🔥 Améliore la réactivité du bouton STOP
                usleep(200000); 
            }

            // ✅ FIN DU PROCESSUS
            $jobModel->refresh();
            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'finished_at' => now()
                ]);

                DB::commit(); 
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