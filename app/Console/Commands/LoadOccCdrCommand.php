<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\LoadOccCdr;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;

class LoadOccCdrCommand extends Command
{
    protected $signature = 'occ:load-cdr {--job-id=}';
    protected $description = 'Charge les CDR OCC dans la base';

    public function handle()
    {
        $jobId = $this->option('job-id');

        if (!$jobId) {
            $this->error('Option --job-id requise.');
            return 1;
        }

        $jobModel = JobTask::find($jobId);

        if (!$jobModel) {
            $this->error('Job non trouvé.');
            return 1;
        }

        try {
            // Marquer le job comme running
            $jobModel->update([
                'status' => 'running',
                'started_at' => now()
            ]);

            Log::info("Load OCC - Début job ID : $jobId");

            // Passer le jobId au constructeur
            $job = new LoadOccCdr($jobId);
            $job->handle();

            // Marquer le job comme terminé
            $jobModel->update([
                'status' => 'stopped',
                'finished_at' => now()
            ]);

            Log::info("Load OCC - Fin job ID : $jobId");

        } catch (\Exception $e) {
            // Marquer le job comme failed en cas d'erreur
            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Load OCC : " . $e->getMessage());
        }

        return 0;
    }
}