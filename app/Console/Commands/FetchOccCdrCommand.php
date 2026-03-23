<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\FetchOccCdr;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;

class FetchOccCdrCommand extends Command
{
    protected $signature = 'occ:fetch-cdr {--job-id=}';
    protected $description = 'Récupère les fichiers CDR OCC depuis le FTP';

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

            Log::info("Fetch OCC - Dispatch job ID : $jobId");

            // ✅ QUEUE
            FetchOccCdr::dispatch();

            $this->info('Fetch OCC envoyé en queue');

        } catch (\Exception $e) {

            $jobModel->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur Fetch OCC : " . $e->getMessage());

            $this->error($e->getMessage());
            return 1;
        }

        return 0;
    }
}