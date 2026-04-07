<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

use App\Models\User;
use App\Models\ServiceSmsPlus;
use App\Models\JobTask;
use App\Models\DbConfig; // Ajoutez cette ligne

class DashboardController extends Controller
{
    public function index()
{   
    $usersCount = User::on('oracle')->count();
    $dbConfigsCount = DbConfig::count(); // Compte le nombre de configurations DB
    
    return Inertia::render('Dashboard', [
        'stats' => [
            'users' => $usersCount,
            'db_configs' => $dbConfigsCount, // Ajoutez cette ligne
        ],
    ]);
}
}