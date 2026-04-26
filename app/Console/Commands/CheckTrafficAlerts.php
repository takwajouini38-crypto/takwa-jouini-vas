<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\CheckTrafficAlertsJob;

class CheckTrafficAlerts extends Command
{
    protected $signature = 'traffic:check-alerts';
    protected $description = 'Lance manuellement l\'analyse des alertes de trafic via un Job';

    public function handle()
    {
        $this->info("Lancement du Job d'analyse du trafic...");

        // On envoie le job dans la file d'attente
        CheckTrafficAlertsJob::dispatch();

        $this->info("Le job a été ajouté à la file d'attente (queue).");
        $this->comment("Utilisez 'php artisan queue:work' pour l'exécuter si vous êtes en local.");
    }
}