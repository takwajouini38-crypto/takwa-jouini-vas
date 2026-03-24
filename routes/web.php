<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MMGTrafficController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\JobTaskActionController;
use App\Http\Controllers\JobTaskController;
use App\Http\Controllers\Admin\DbConfigController;
use App\Http\Controllers\ServiceSmsPlusController;
use App\Http\Controllers\Admin\FtpSettingController;
use App\Http\Controllers\DashboardController;

Route::resource('services', ServiceSmsPlusController::class)->except(['show']);

// Page d'accueil (publique)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'checkrole:admin'])
    ->name('dashboard');
// Routes pour tous les utilisateurs connectés (profil)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Routes réservées aux administrateurs (rôle 'admin')
Route::middleware(['auth', 'checkrole:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users/check-email', [UserController::class, 'checkEmail'])
    ->name('users.checkEmail');
    // Gestion des utilisateurs
    Route::resource('users', UserController::class);
    Route::get('/ftp', [FtpSettingController::class, 'index'])->name('ftp.index');
    Route::post('/ftp', [FtpSettingController::class, 'store'])->name('ftp.store');
    Route::put('/ftp/{id}', [FtpSettingController::class, 'update'])->name('ftp.update');
    Route::delete('/ftp/{id}', [FtpSettingController::class, 'destroy'])->name('ftp.destroy');

Route::post('/ftp/{id}/active', [FtpSettingController::class, 'setActive'])->name('ftp.active');
Route::post('/ftp/test', [FtpSettingController::class, 'testConnection'])->name('ftp.test');

    
    // Gestion de la configuration de la base de données
    Route::get('db', [DbConfigController::class, 'index'])->name('db.index');
    Route::post('db', [DbConfigController::class, 'storeOrUpdate'])->name('db.store');
    Route::post('db/test-connection', [DbConfigController::class, 'testConnection'])->name('db.test');
});

Route::middleware(['auth', 'checkrole:analyst_op'])->group(function () {
    Route::get('/mmg-traffic', [MMGTrafficController::class, 'index'])->name('mmg.traffic');
    Route::get('/dashboard-op', [MMGTrafficController::class, 'index'])->name('dashboard.op');
});




// Routes pour les analystes business (rôle 'analyst_biz')
Route::middleware(['auth', 'checkrole:analyst_biz'])->group(function () {
    Route::get('/dashboard-biz', function () {
        return Inertia::render('Dashboards/BusinessDashboard');
    })->name('dashboard.biz');
});

// Routes communes à tous les utilisateurs authentifiés (suivi des jobs)
Route::middleware(['auth'])->group(function () {
    Route::get('/suivi-jobs', [JobTaskController::class, 'index'])->name('job-tasks.dashboard');
    Route::post('/job-tasks/{jobTask}/start', [JobTaskActionController::class, 'start'])->name('job-tasks.start');
    Route::post('/job-tasks/{jobTask}/stop', [JobTaskActionController::class, 'stop'])->name('job-tasks.stop');
});

// Routes d'authentification (login, register, etc.) fournies par Laravel Breeze/Jetstream
require __DIR__.'/auth.php';