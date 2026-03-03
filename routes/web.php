<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MMGTrafficController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\JobTaskActionController;
use App\Http\Controllers\JobTaskController;

// Page d'accueil
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Dashboard général
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Routes pour tous les utilisateurs connectés
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin uniquement
Route::middleware(['auth', 'checkrole:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});

// Analyste opérationnel uniquement
Route::middleware(['auth', 'checkrole:analyst_op'])->group(function () {
    Route::get('/mmg-traffic', [MMGTrafficController::class, 'index'])
        ->name('mmg.traffic');
    
    Route::get('/dashboard-op', [MMGTrafficController::class, 'index'])
        ->name('dashboard.op');
});

// Analyste business + Admin
Route::middleware(['auth', 'checkrole:analyst_biz'])->group(function () {
    Route::get('/dashboard-biz', function () {
        return Inertia::render('Dashboards/BusinessDashboard');
    })->name('dashboard.biz');
});


Route::middleware(['auth'])->group(function () {
    Route::get('/suivi-jobs', [JobTaskController::class, 'index'])->name('job-tasks.dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::post('/job-tasks/{jobTask}/start', [JobTaskActionController::class, 'start'])->name('job-tasks.start');
    Route::post('/job-tasks/{jobTask}/stop', [JobTaskActionController::class, 'stop'])->name('job-tasks.stop');
});
// Auth routes par défaut
require __DIR__.'/auth.php';