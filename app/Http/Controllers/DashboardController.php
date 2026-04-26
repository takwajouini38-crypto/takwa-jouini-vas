<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

use App\Models\User;
use App\Models\ServiceSmsPlus;
use App\Models\JobTask;
use App\Models\DbConfig;
use App\Models\FtpSetting; // Changé de FtpConfig à FtpSetting

class DashboardController extends Controller
{
    public function index()
{   
    // Statistiques principales
    $usersCount = User::on('oracle')->count();
    $dbConfigsCount = DbConfig::count();
    $ftpConfigsCount = FtpSetting::count(); // Changé de FtpConfig à FtpSetting
    
    // Derniers utilisateurs créés
    $latestUsers = User::on('oracle')->orderBy('created_at', 'desc')->limit(5)->get();
    
    // Dernières configurations DB
    $latestDbConfigs = DbConfig::orderBy('created_at', 'desc')->limit(5)->get();
    
    // Dernières configurations FTP
    $latestFtpConfigs = FtpSetting::orderBy('created_at', 'desc')->limit(5)->get(); // Changé de FtpConfig à FtpSetting
    
    // Dernière activité globale
    $lastUserCreated = User::on('oracle')->orderBy('created_at', 'desc')->first();
    $lastDbConfig = DbConfig::orderBy('created_at', 'desc')->first();
    $lastFtpConfig = FtpSetting::orderBy('created_at', 'desc')->first(); // Changé de FtpConfig à FtpSetting*/
    
    return Inertia::render('Dashboard', [
        'stats' => [
            'users' => $usersCount,
            'db_configs' => $dbConfigsCount,
            'ftp_configs' => $ftpConfigsCount,
        ],
        'latestUsers' => $latestUsers,
        'latestDbConfigs' => $latestDbConfigs,
        'latestFtpConfigs' => $latestFtpConfigs,
        'lastActivity' => [
            'user' => $lastUserCreated,
            'db' => $lastDbConfig,
            'ftp' => $lastFtpConfig,
        ],
    ]);
    }
}