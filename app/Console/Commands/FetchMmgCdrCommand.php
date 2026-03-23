<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\FetchMmgCdr;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;

class FetchMmgCdrCommand extends Command
{
    protected $signature = 'mmg:fetch-cdr {--job-id=}';
    protected $description = 'Récupère les fichiers CDR MMG depuis le FTP';

   public function handle()
{
    $jobId = $this->option('job-id');

    if (!$jobId) {
        $this->error('Option --job-id requise.');
        return 1;
    }

    $jobModel = \App\Models\JobTask::find($jobId);

    if (!$jobModel) {
        $this->error('Job non trouvé.');
        return 1;
    }

    $jobModel->update([
        'status' => 'running',
        'started_at' => now()
    ]);

    \Log::info("Dispatch Fetch MMG job ID : $jobId");

    // ✅ QUEUE
    \App\Jobs\FetchMmgCdr::dispatch();

    $this->info('Fetch envoyé en queue');

    return 0;
}
}