<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;
use App\Models\JobTask;
use App\Services\FtpService;

class FetchOccCdr implements ShouldQueue
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
        Log::info("=== START FETCH OCC [ID: {$this->jobId}] ===");

        $jobModel = JobTask::find($this->jobId);

        if (!$jobModel) {
            Log::error("Job OCC introuvable");
            return;
        }

        try {
            $jobModel->update(['status' => 'running']);
            $localFtp = Storage::disk('cdr_storage');
            $files = $ftpService->listFiles('occ');

            Log::info("Nombre de fichiers OCC détectés : " . count($files));

            foreach ($files as $filePath) {
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job OCC [ID: {$this->jobId}] stoppé");
                    return;
                }

                if (!str_ends_with($filePath, '.csv')) continue;

                $filename = basename($filePath);
                $tempStream = fopen('php://temp', 'r+');
                $conn = $ftpService->connect();
                
                // Utilisation de @ pour ignorer le warning SSL lors du transfert
                if (@ftp_fget($conn, $tempStream, $filePath, FTP_BINARY)) {
                    rewind($tempStream);
                    
                    // --- 🛡️ GESTION DU FICHIER CORROMPU ---
                    $fileSize = fstat($tempStream)['size'];

                    if ($fileSize > 0) {
                        // Fichier sain
                        $localFtp->put('occ/' . $filename, $tempStream);
                        Log::info("Fichier OCC stocké : {$filename}");
                        
                        $ftpService->move($filePath, 'occ/processed/' . $filename);
                    } else {
                        // Fichier vide (corrompu)
                        Log::error("Fichier OCC corrompu détecté : {$filename}");
                        $ftpService->move($filePath, 'occ/corrupted/' . $filename);
                    }

                    fclose($tempStream);
                    @ftp_close($conn); // @ pour ignorer le bug SSL shutdown
                } else {
                    if (is_resource($tempStream)) fclose($tempStream);
                    if (is_resource($conn)) @ftp_close($conn);
                    Log::error("Échec du téléchargement OCC : {$filename}");
                }

                usleep(200000);
            }

            $jobModel->update(['status' => 'success', 'updated_at' => now()]);
            Log::info("=== FETCH OCC SUCCESS [ID: {$this->jobId}] ===");

        } catch (\Exception $e) {
            // Gestion de l'erreur SSL persistante
            if (str_contains($e->getMessage(), 'SSL_read on shutdown')) {
                Log::warning("Alerte SSL ignorée pour OCC.");
                $jobModel->update(['status' => 'success', 'updated_at' => now()]);
            } else {
                Log::error("Erreur Fetch OCC : " . $e->getMessage());
                $jobModel->update(['status' => 'failed', 'updated_at' => now()]);
            }
        }
    }
}