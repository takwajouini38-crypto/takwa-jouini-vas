<?php

namespace App\Http\Controllers;

use App\Models\JobTask;
use Illuminate\Support\Facades\Artisan;

class JobTaskActionController extends Controller
{
    public function start(JobTask $jobTask)
    {
        if ($jobTask->status === 'running') {
            return response()->json(['error' => 'Job déjà en cours'], 400);
        }

        $commandMap = [
            'fetch_mmg'    => 'mmg:fetch-cdr',
            'loading_mmg'  => 'mmg:load-cdr',
            'fetch_occ'    => 'occ:fetch-cdr',
            'loading_occ'  => 'occ:load-cdr',
            'agg_mmg'      => 'mmg:agg',
            'agg_occ'      => 'occ:agg',
            'suppression'  => 'cdr:purge',
        ];

        $command = $commandMap[$jobTask->type] ?? null;

        if (!$command) {
            return response()->json(['error' => 'Type de job inconnu'], 400);
        }

        // ✅ 1. Mettre RUNNING
        $jobTask->update([
            'status' => 'running',
            'started_at' => now(),
            'finished_at' => null
        ]);

        try {
            // ✅ 2. Exécution
            Artisan::call($command, [
                '--job-id' => $jobTask->id
            ]);

            // ✅ 3. Mettre SUCCESS après exécution
            $jobTask->update([
                'status' => 'success',
                'finished_at' => now()
            ]);

        } catch (\Exception $e) {

            // ❌ Si erreur
            $jobTask->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            return response()->json([
                'error' => 'Erreur job',
                'message' => $e->getMessage()
            ], 500);
        }

        return response()->json(['success' => true]);
    }

    public function stop(JobTask $jobTask)
    {
        if ($jobTask->status !== 'running') {
            return response()->json(['error' => 'Job non démarré'], 400);
        }

        $jobTask->update([
            'status' => 'stopped',
            'finished_at' => now()
        ]);

        return response()->json(['success' => true]);
    }
}