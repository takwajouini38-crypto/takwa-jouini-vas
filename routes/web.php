<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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


// Analyste Opérationnelle + Admin
Route::middleware(['auth', 'checkrole:analyst_op,admin'])->group(function () {
    Route::get('/dashboard-op', function () {
        return Inertia::render('Dashboards/OperationalDashboard');
    })->name('dashboard.op');
});


//  Analyste Business + Admin
Route::middleware(['auth', 'checkrole:analyst_biz,admin'])->group(function () {
    Route::get('/dashboard-biz', function () {
        return Inertia::render('Dashboards/BusinessDashboard');
    })->name('dashboard.biz');
});


require __DIR__.'/auth.php';
