<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\AggregateOccCdr;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;

class AggregateOccCdrCommand extends Command
{
    protected $signature = 'occ:agg {--job-id=}';
    protected $description = 'Agrège les CDR OCC';

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

            Log::info("Aggregate OCC - Dispatch job ID : $jobId");

            // ✅ QUEUE
            AggregateOccCdr::dispatch($jobId);

            $this->info('Aggregate OCC envoyé en queue');

        } catch (\Exception $e) {

            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Aggregate OCC : " . $e->getMessage());

            $this->error($e->getMessage());
            return 1;
        }

        return 0;
    }
}