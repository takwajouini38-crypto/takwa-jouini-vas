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

class FetchOccCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $jobId;

    public function __construct($jobId)
    {
        $this->jobId = $jobId;
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
            // Disque local final
            $localFtp = Storage::disk('cdr_storage');

            // 1. Lister les fichiers sur le serveur distant (dossier 'occ')
            $files = $ftpService->listFiles('occ');

            Log::info("Nombre de fichiers OCC détectés : " . count($files));

            foreach ($files as $filePath) {

                // 🔴 STOP CHECK AVANT CHAQUE FICHIER
                $jobModel->refresh();
                if ($jobModel->status !== 'running') {
                    Log::warning("Job OCC stoppé par l'administrateur");
                    return;
                }

                if (!str_ends_with($filePath, '.csv')) continue;

                $filename = basename($filePath);
                Log::info("Téléchargement direct OCC : {$filename}");

                // 2. RÉCUPÉRATION ET STOCKAGE DIRECT (Optimisé via flux mémoire)
                $tempStream = fopen('php://temp', 'r+');
                
                // Connexion via le service
                $conn = $ftpService->connect();
                
                // 🔴 STOP CHECK AVANT DOWNLOAD
                if ($jobModel->status !== 'running') {
                    fclose($tempStream);
                    ftp_close($conn);
                    return;
                }

                if (ftp_fget($conn, $tempStream, $filePath, FTP_BINARY)) {
                    rewind($tempStream);
                    
                    // Écriture directe dans le stockage local (dossier occ/)
                    $localFtp->put('occ/' . $filename, $tempStream);
                    
                    fclose($tempStream);
                    ftp_close($conn);

                    Log::info("Fichier OCC stocké localement : occ/{$filename}");

                    // 🔴 STOP CHECK AVANT ARCHIVAGE DISTANT
                    $jobModel->refresh();
                    if ($jobModel->status !== 'running') return;

                    // 3. ARCHIVAGE DISTANT (Move sur le serveur FTP)
                    $ftpService->move($filePath, 'occ/processed/' . $filename);
                    Log::info("Fichier OCC déplacé vers processed sur le serveur");
                } else {
                    fclose($tempStream);
                    ftp_close($conn);
                    Log::error("Échec du téléchargement OCC pour le fichier : {$filename}");
                }

                // 🔥 Améliore réactivité du bouton STOP
                usleep(200000);
            }

            // ✅ FIN PROPRE
            $jobModel->refresh();
            if ($jobModel->status === 'running') {
                $jobModel->update([
                    'status' => 'success',
                    'finished_at' => now()
                ]);

                DB::commit();
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