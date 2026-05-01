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
use App\Services\FtpService;

class FetchMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
        $this->onQueue('etl');
    }

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
            $jobModel->update(['status' => 'running']);
            
            $localFtp = Storage::disk('cdr_storage');
            $files = $ftpService->listFiles('mmg');

            Log::info("Fichiers détectés sur le serveur FTP : " . count($files));

            foreach ($files as $filePath) {
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job {$this->jobId} stoppé par l'administrateur");
                    return; 
                }

                if (!str_ends_with($filePath, '.csv')) continue;

                $filename = basename($filePath);
                $tempStream = fopen('php://temp', 'r+');
                $conn = $ftpService->connect();
                
                // Utilisation du @ pour ignorer les alertes SSL lors du transfert
                if (@ftp_fget($conn, $tempStream, $filePath, FTP_BINARY)) {
                    rewind($tempStream);
                    
                    // --- 🛡️ GESTION DU FICHIER CORROMPU (VIDE) ---
                    $fileSize = fstat($tempStream)['size'];

                    if ($fileSize > 0) {
                        // Fichier sain : on sauvegarde et on archive normalement
                        $localFtp->put('mmg/' . $filename, $tempStream);
                        Log::info("Téléchargement réussi : {$filename}");
                        
                        $ftpService->move($filePath, 'mmg/processed/' . $filename);
                    } else {
                        // Fichier corrompu : on log et on déplace dans un dossier spécifique
                        Log::error("Fichier corrompu détecté (0 octet) : {$filename}");
                        
                        // Déplacement vers un dossier 'corrupted' pour analyse manuelle
                        $ftpService->move($filePath, 'mmg/corrupted/' . $filename);
                    }

                    fclose($tempStream);
                    @ftp_close($conn); // @ pour éviter le crash SSL shutdown
                } else {
                    if (is_resource($tempStream)) fclose($tempStream);
                    if (is_resource($conn)) @ftp_close($conn);
                    Log::error("Échec du téléchargement (réseau ou SSL) : {$filename}");
                }

                usleep(200000); 
            }

            $jobModel->update([
                'status' => 'success',
                'updated_at' => now()
            ]);

            Log::info("=== FETCH MMG SUCCESS [ID: {$this->jobId}] ===");

        } catch (\Exception $e) {
            // Si l'erreur est purement SSL_read (shutdown), on valide quand même le succès
            if (str_contains($e->getMessage(), 'SSL_read on shutdown')) {
                Log::warning("Alerte SSL ignorée : le traitement est terminé.");
                $jobModel->update(['status' => 'success', 'updated_at' => now()]);
            } else {
                Log::error("Erreur Fetch MMG : " . $e->getMessage());
                $jobModel->update(['status' => 'failed', 'updated_at' => now()]);
            }
        }
    }
}