<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\PurgeCdrDetail; // 🔹 Important

class PurgeCdrDetailCommand extends Command
{
    protected $signature = 'cdr:purge';
    protected $description = 'Supprime les CDR de plus de 90 jours (MMG & OCC)';

    public function handle()
    {
        $this->info('Début de la purge des CDR...');

        // Exécution immédiate du job
        PurgeCdrDetail::dispatchSync();

        $this->info('Purge terminée avec succès.');
    }
}