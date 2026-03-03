<?php

namespace App\Http\Controllers;

use App\Models\JobTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class JobTaskActionController extends Controller
{
    public function start(JobTask $jobTask)
    {
        if ($jobTask->status === 'running') {
            return response()->json(['error' => 'Job déjà en cours'], 400);
        }

        // Mapping type → commande
        $commandMap = [
            'loading_mmg'  => 'mmg:load-cdr',
            'loading_occ'  => 'occ:load-cdr',
            'agg_mmg'      => 'mmg:agg',
            'agg_occ'      => 'occ:agg',
            'suppression'  => 'cdr:purge',
        ];

        $command = $commandMap[$jobTask->type] ?? null;
        if (!$command) {
            return response()->json(['error' => 'Type de job inconnu'], 400);
        }

        // Mise à jour immédiate du statut
        $jobTask->update(['status' => 'running']);

        // Lancement de la commande en arrière-plan via la queue
        Artisan::queue($command, ['--job-id' => $jobTask->id]);

        return response()->json(['success' => true]);
    }

    public function stop(JobTask $jobTask)
    {
        if ($jobTask->status !== 'running') {
            return response()->json(['error' => 'Job non démarré'], 400);
        }

        $jobTask->update(['status' => 'stopped']);

        return response()->json(['success' => true]);
    }
}