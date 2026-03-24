<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

use App\Models\User;
use App\Models\ServiceSmsPlus;
use App\Models\JobTask;

class DashboardController extends Controller
{
    public function index()
{   
    $usersCount = User::on('oracle')->count();
    $servicesCount = ServiceSmsPlus::on('oracle')->count();
    $jobsCount = JobTask::on('oracle')->count();

    $jobStats = [
        [
            'name' => 'Succès',
            'value' => JobTask::on('oracle')->where('status', 'success')->count(),
        ],
        [
            'name' => 'Échoué',
            'value' => JobTask::on('oracle')->where('status', 'failed')->count(),
        ],
        [
            'name' => 'En cours',
            'value' => JobTask::on('oracle')->where('status', 'running')->count(),
        ],
    ];

    return Inertia::render('Dashboard', [
        'stats' => [
            'users' => $usersCount,
            'services' => $servicesCount,
            'jobs' => $jobsCount,
        ],
        'jobStats' => $jobStats,
    ]);
}
}