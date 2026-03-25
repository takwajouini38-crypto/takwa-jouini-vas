<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\PurgeCdrDetail;
use App\Models\JobTask;
use Illuminate\Support\Facades\DB;

class PurgeCdrDetailCommand extends Command
{
    // Signature avec l'option job-id
    protected $signature = 'cdr:purge {--job-id=}';
    protected $description = 'Supprime les fichiers traités et les CDR de plus de 30 jours';

    public function handle()
    {
        $jobId = $this->option('job-id');

        if (!$jobId) {
            $this->error('Option --job-id requise.');
            return 1;
        }

        $jobModel = JobTask::find($jobId);

        if ($jobModel) {
            $jobModel->update([
                'status' => 'running',
                'started_at' => now()
            ]);
            DB::commit();
        }

        $this->info('Envoi du job de purge en file d\'attente...');

        // On dispatch le job avec l'ID
        PurgeCdrDetail::dispatch($jobId);

        return 0;
    }
}