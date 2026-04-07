<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- CONFIGURATION ETL TUNISIE TELECOM ---

// En développement : Test toutes les minutes
// Le withoutOverlapping() est CRUCIAL : il crée un verrou (lock) 
// pour empêcher une 2ème chaîne de démarrer si la 1ère n'est pas finie.
// Dans routes/console.php
Schedule::command('cdr:run-etl')
    ->everyFiveMinutes() // On passe à 5 minutes pour laisser la chaîne finir
    ->onOneServer() // Utile si tu as plusieurs instances
    ->withoutOverlapping(10); // Le 10 signifie que le verrou expire après 10 min quoi qu'il arrive

// En production réelle :
// Schedule::command('cdr:run-etl')->dailyAt('02:00')->withoutOverlapping();