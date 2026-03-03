<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\LoadMmgCdr;
use App\Models\JobTask; // ← Correction ici
use Illuminate\Support\Facades\Log;

class LoadMmgCdrCommand extends Command
{
    protected $signature = 'mmg:load-cdr {--job-id= : ID du job dans la table job_tasks}';
    protected $description = 'Charge les fichiers CDR MMG depuis le FTP vers Oracle';

    public function handle()
    {
        $jobId = $this->option('job-id');
        Log::info('LoadMmgCdrCommand - Job ID reçu : ' . $jobId); // ← Log
        if (!$jobId) {
            $this->error('L\'option --job-id est requise.');
            return 1;
        }

        // Utiliser JobTask
        $jobModel = JobTask::find($jobId);
        if (!$jobModel) {
            Log::error('LoadMmgCdrCommand - Job non trouvé : ' . $jobId); // ← Log
            $this->error('Job non trouvé.');
            return 1;
        }

        $jobModel->update(['status' => 'running']);
        $this->info('Début du job LoadMmgCdr...');
        Log::info('LoadMmgCdrCommand - Début du job pour job ID ' . $jobId); // ← Log
        $job = new LoadMmgCdr($jobId);

        try {
            Log::info('LoadMmgCdrCommand - Avant exécution du job'); // ← Log
            $job->handle();
            Log::info('LoadMmgCdrCommand - Après exécution du job'); // ← Log
        } catch (\Exception $e) {
            $jobModel->update(['status' => 'failed']);
            Log::error('LoadMmgCdrCommand - Erreur : ' . $e->getMessage()); // ← Log
            $this->error('Erreur : ' . $e->getMessage());
            return 1;
        }

        $jobModel->update(['status' => 'stopped']);
        $this->info('Job terminé avec succès !');
        Log::info('LoadMmgCdrCommand - Job terminé avec succès pour job ID ' . $jobId); // ← Log
        return 0;
    }
}