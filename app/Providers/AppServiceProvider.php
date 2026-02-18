<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia; // ✅ Ajouter Inertia
use Illuminate\Support\Facades\Auth; // ✅ Ajouter Auth

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Préchargement Vite
        Vite::prefetch(concurrency: 3);

        // ✅ Partager auth.user avec Inertia
        Inertia::share([
            'auth' => function () {
                return [
                    'user' => Auth::user(),
                ];
            },
        ]);
    }
}
