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

    if (!$jobId) {
        $this->error('Option --job-id requise.');
        return 1;
    }

    $jobModel = JobTask::find($jobId);

    if (!$jobModel) {
        $this->error('Job non trouvé.');
        return 1;
    }

    $jobModel->update([
        'status' => 'running',
        'started_at' => now()
    ]);

    \Log::info("Dispatch Load MMG job ID : $jobId");

    // ✅ QUEUE
    \App\Jobs\LoadMmgCdr::dispatch($jobId);

    $this->info('Job envoyé en queue avec succès');

    return 0;
}
}