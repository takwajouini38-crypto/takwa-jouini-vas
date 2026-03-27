<?php
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\JobTaskActionController;
use App\Http\Controllers\JobTaskController;
use App\Http\Controllers\Admin\DbConfigController;
use App\Http\Controllers\ServiceSmsPlusController;
use App\Http\Controllers\Admin\FtpSettingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AnalysteBiz\AnalysteBusinessController;

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
// --- Routes Analyste Business (Dashboard Revenus) ---
Route::middleware(['auth'])->prefix('analyste-biz')->group(function () {
    Route::get('/analytics', [AnalysteBusinessController::class, 'analytics'])->name('analyste.analytics');
    Route::get('/top-services', [AnalysteBusinessController::class, 'topServicesPage'])->name('analyste.top');
    Route::get('/search', [AnalysteBusinessController::class, 'searchPage'])->name('analyste.search');
    Route::get('/api/search', [AnalysteBusinessController::class, 'execSearch'])->name('analyste.api.search');
    Route::get('/export', [AnalysteBusinessController::class, 'exportExcel'])->name('analyste.export');
});
// route accessible seulement pour analyste biz 
Route::middleware(['auth', 'verified', 'checkrole:analyst_biz'])->group(function () {
    // On appelle la méthode dashboard du contrôleur
    Route::get('/biz-dashboard', [AnalysteBusinessController::class, 'dashboard'])->name('biz.dashboard');
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
   // --- GESTION BASE DE DONNÉES ORACLE ---
    Route::get('db', [DbConfigController::class, 'index'])->name('db.index');          // Affichage + Tableau
    Route::post('db', [DbConfigController::class, 'store'])->name('db.store');         // Création
    Route::put('db/{id}', [DbConfigController::class, 'update'])->name('db.update');   // Modification
    Route::delete('db/{id}', [DbConfigController::class, 'destroy'])->name('db.destroy'); // Suppression
    Route::post('db/test-connection', [DbConfigController::class, 'testConnection'])->name('db.test');
});


// Routes accessibles uniquement par l'Admin et l'Analyste Opérationnel
Route::middleware(['auth', 'checkrole:admin,analyst_op'])->group(function () {
    Route::get('/suivi-jobs', [JobTaskController::class, 'index'])->name('job-tasks.dashboard');
    Route::post('/job-tasks/{jobTask}/start', [JobTaskActionController::class, 'start'])->name('job-tasks.start');
    Route::post('/job-tasks/{jobTask}/stop', [JobTaskActionController::class, 'stop'])->name('job-tasks.stop');
});

// Routes d'authentification (login, register, etc.) fournies par Laravel Breeze/Jetstream
require __DIR__.'/auth.php';