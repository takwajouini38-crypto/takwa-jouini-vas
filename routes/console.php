<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\CheckTrafficAlertsJob;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- 1. CHAÎNE ETL (TRAITEMENT LOURD) ---
// On l'envoie sur la queue 'etl'
Schedule::command('cdr:run-etl')
    ->everyMinute()
    ->onOneServer()
    ->withoutOverlapping(10);
    

// --- 2. ANALYSE DU TRAFIC (CRITIQUE/RAPIDE) ---
// On l'envoie sur la queue 'traffic'
/*Schedule::job(new CheckTrafficAlertsJob)
    ->everyFiveMinutes()
->onOneServer()
    ->withoutOverlapping(10);*/