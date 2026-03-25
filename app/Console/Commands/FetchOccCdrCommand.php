<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\FetchOccCdr;
use App\Models\JobTask;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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
            // ✅ Mise à jour du statut initial
            $jobModel->update([
                'status' => 'running',
                'started_at' => now()
            ]);
            
            // On valide pour Oracle
            DB::commit();

            Log::info("Fetch OCC - Dispatch job ID : $jobId");

            // ✅ CORRECTION CRITIQUE : On passe $jobId au Job ici !
            FetchOccCdr::dispatch($jobId);

            $this->info("Job $jobId envoyé en queue avec succès.");

        } catch (\Exception $e) {
            // ✅ Correction ORA-00904 : On retire finished_at
            $jobModel->update([
                'status' => 'failed'
            ]);
            
            DB::commit();

            Log::error("Erreur Dispatch Fetch OCC : " . $e->getMessage());
            $this->error($e->getMessage());
            return 1;
        }

        return 0;
    }
}