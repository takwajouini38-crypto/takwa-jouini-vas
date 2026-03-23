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

    $jobModel = \App\Models\JobTask::find($jobId);

    if (!$jobModel) {
        $this->error('Job non trouvé.');
        return 1;
    }

    $jobModel->update([
        'status' => 'running',
        'started_at' => now()
    ]);

    \Log::info("Dispatch Aggregate MMG job ID : $jobId");

    // ✅ QUEUE
    \App\Jobs\AggregateMmgCdr::dispatch($jobId);

    $this->info('Aggregate envoyé en queue');

    return 0;
}
}