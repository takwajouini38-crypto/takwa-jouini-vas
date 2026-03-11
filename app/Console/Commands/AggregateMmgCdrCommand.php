<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\AggregateMmgCdr;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;

class AggregateMmgCdrCommand extends Command
{
    protected $signature = 'mmg:agg {--job-id=}';
    protected $description = 'Agrège les CDR MMG dans la table AGG';

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
            $jobModel->update([
                'status' => 'running',
                'started_at' => now()
            ]);

            Log::info("Aggregate MMG - Début job ID : $jobId");

            // Exécution directe du job
            $job = new AggregateMmgCdr();
            $job->handle();

            $jobModel->update([
                'status' => 'stopped',
                'finished_at' => now()
            ]);

            Log::info("Aggregate MMG - Fin job ID : $jobId");

            $this->info('Job d’agrégation exécuté avec succès');

        } catch (\Exception $e) {
            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Aggregate MMG : " . $e->getMessage());

            $this->error($e->getMessage());
            return 1;
        }

        return 0;
    }
}