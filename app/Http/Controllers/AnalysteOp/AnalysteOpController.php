<?php

namespace App\Http\Controllers\AnalysteOp;

use App\Models\ServiceSmsPlus;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\JobTask;

class AnalysteOpController extends Controller
{
    public function dashboard()
    {
        // Statistiques principales
        $stats = [
            'total'   => JobTask::count(),
            'running' => JobTask::where('status', 'running')->count(),
            'failed'  => JobTask::where('status', 'failed')->count(),
            'success' => JobTask::where('status', 'success')->count(),
            'services_count' => ServiceSmsPlus::count(),
        ];
        
        // Derniers jobs - trier par updated_at (date de dernière exécution)
        $latestJobs = JobTask::orderBy('updated_at', 'desc')->limit(10)->get();
        
        // Statistiques par statut
        $statusStats = [
            'running' => JobTask::where('status', 'running')->count(),
            'success' => JobTask::where('status', 'success')->count(),
            'failed'  => JobTask::where('status', 'failed')->count(),
            'pending' => JobTask::where('status', 'pending')->count(),
        ];
        
        // Taux de succès
        $successRate = $stats['total'] > 0 
            ? round(($stats['success'] / $stats['total']) * 100, 2) 
            : 0;
        
        // Dernière activité - utiliser updated_at
        $lastJob = JobTask::orderBy('updated_at', 'desc')->first();
        
     
        
        return Inertia::render('AnalysteOp/OpMainView', [
            'stats' => $stats,
            'latestJobs' => $latestJobs,
            'statusStats' => $statusStats,
            'successRate' => $successRate,
            'lastJob' => $lastJob,
        ]);
    }
}