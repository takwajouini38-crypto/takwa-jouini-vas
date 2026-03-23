<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\LoadOccCdr;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;

class LoadOccCdrCommand extends Command
{
    protected $signature = 'occ:load-cdr {--job-id=}';
    protected $description = 'Charge les fichiers CDR OCC vers Oracle';

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

            Log::info("Load OCC - Dispatch job ID : $jobId");

            // ✅ QUEUE
            LoadOccCdr::dispatch($jobId);

            $this->info('Load OCC envoyé en queue');

        } catch (\Exception $e) {

            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Load OCC : " . $e->getMessage());

            $this->error($e->getMessage());
            return 1;
        }

        return 0;
    }
}