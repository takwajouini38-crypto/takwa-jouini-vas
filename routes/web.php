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
use App\Http\Controllers\AnalysteOp\AnalysteOpController;
use App\Http\Controllers\AnalysteOp\TrafficMonitoringController;
use App\Http\Controllers\AlertController;

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

// Remplacer 'role:analyste_biz|analyste_op' par ton propre middleware de rôle
Route::middleware(['auth', 'checkrole:analyst_biz'])->prefix('monitoring')->group(function () {
    
    Route::get('/historique-alertes', [AlertController::class, 'index'])->name('alerts.index');
    Route::patch('/alerts/{alert}', [AlertController::class, 'updateMotif'])->name('alerts.update');
    // Nouvelles routes séparées
    Route::get('/analytics/providers', [AnalysteBusinessController::class, 'revenueByProviderPage'])->name('analyste.providers');
    Route::get('/analytics/services', [AnalysteBusinessController::class, 'revenueByServicePage'])->name('analyste.services');
    Route::get('/analytics', [AnalysteBusinessController::class, 'analytics'])->name('analyste.analytics');
    Route::get('/top-services', [AnalysteBusinessController::class, 'topServicesPage'])->name('analyste.top');
    Route::get('/search', [AnalysteBusinessController::class, 'searchPage'])->name('analyste.search');
    Route::post('/bulk-search', [AnalysteBusinessController::class, 'execBulkSearch'])->name('analyste.bulk.search');
    Route::get('/api/search', [AnalysteBusinessController::class, 'execSearch'])->name('analyste.api.search');
    Route::get('/export', [AnalysteBusinessController::class, 'exportExcel'])->name('analyste.export');
});

// Route spécifique au rôle biz
Route::middleware(['auth', 'verified', 'checkrole:analyst_biz'])->group(function () {
    Route::get('/biz-dashboard', [AnalysteBusinessController::class, 'dashboard'])->name('biz.dashboard');
});

// --- RESTES DES ROUTES (Admin, Op, etc.) ---
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified', 'checkrole:admin'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'checkrole:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users/check-email', [UserController::class, 'checkEmail'])->name('users.checkEmail');
    Route::resource('users', UserController::class);
    Route::get('/ftp', [FtpSettingController::class, 'index'])->name('ftp.index');
    Route::post('/ftp', [FtpSettingController::class, 'store'])->name('ftp.store');
    Route::put('/ftp/{id}', [FtpSettingController::class, 'update'])->name('ftp.update');
    Route::delete('/ftp/{id}', [FtpSettingController::class, 'destroy'])->name('ftp.destroy');
    Route::post('/ftp/{id}/active', [FtpSettingController::class, 'setActive'])->name('ftp.active');
    Route::post('/ftp/test', [FtpSettingController::class, 'testConnection'])->name('ftp.test');
    Route::get('db', [DbConfigController::class, 'index'])->name('db.index');
    Route::post('db', [DbConfigController::class, 'store'])->name('db.store');
    Route::put('db/{id}', [DbConfigController::class, 'update'])->name('db.update');
    Route::delete('db/{id}', [DbConfigController::class, 'destroy'])->name('db.destroy');
    Route::post('db/test-connection', [DbConfigController::class, 'testConnection'])->name('db.test');
    Route::post('db/{id}/active', [DbConfigController::class, 'setActive'])->name('db.active');
});

Route::middleware(['auth', 'checkrole:analyst_op'])->group(function () {
    Route::get('/suivi-jobs', [JobTaskController::class, 'index'])->name('job-tasks.dashboard');
    Route::post('/job-tasks/{jobTask}/start', [JobTaskActionController::class, 'start'])->name('job-tasks.start');
    Route::post('/job-tasks/{jobTask}/stop', [JobTaskActionController::class, 'stop'])->name('job-tasks.stop');
    Route::get('/analyste-op/traffic', [TrafficMonitoringController::class, 'index'])->name('analyste-op.traffic');
});

Route::middleware(['auth', 'verified', 'checkrole:analyst_op'])->group(function () {
    Route::get('/op-dashboard', [AnalysteOpController::class, 'dashboard'])->name('op.dashboard');
});

require __DIR__.'/auth.php';
