<?php

namespace App\Http\Controllers;

use App\Models\JobTask;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

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

        $jobTask->update([
            'status' => 'running',
            'started_at' => now(),
            'finished_at' => null
        ]);

        try {
            Artisan::call($command, [
                '--job-id' => $jobTask->id
            ]);

            Log::info("Commande {$command} envoyée pour Job ID: {$jobTask->id}");

        } catch (\Exception $e) {
            $jobTask->update([
                'status' => 'failed',
                'finished_at' => now()
            ]);

            Log::error("Erreur lancement job: " . $e->getMessage());

            return response()->json(['error' => 'Erreur lancement job'], 500);
        }

        return response()->json(['success' => true]);
    }

    // ✅ STOP CORRIGÉ
    public function stop(JobTask $jobTask)
    {
        if ($jobTask->status !== 'running') {
            return response()->json(['error' => 'Job non en cours'], 400);
        }

        $jobTask->update([
            'status' => 'stopped',
            'finished_at' => now()
        ]);

        Log::warning("Job ID {$jobTask->id} arrêté par utilisateur");

        return response()->json(['success' => true]);
    }
}