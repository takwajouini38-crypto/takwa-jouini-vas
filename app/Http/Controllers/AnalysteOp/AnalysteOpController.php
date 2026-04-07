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
    $stats = [
        'total'   => JobTask::count(),
        'running' => JobTask::where('status', 'running')->count(),
        'failed'  => JobTask::where('status', 'failed')->count(),
        // Ajout du nombre de services
        'services_count' => ServiceSmsPlus::count(), 
    ];

    return Inertia::render('AnalysteOp/OpMainView', [
        'stats' => $stats
    ]);
}
}