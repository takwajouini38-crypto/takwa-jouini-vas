<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Jobs\FetchMmgCdr;

class FetchMmgCdrCommand extends Command
{
    // La signature de la commande artisan
    protected $signature = 'fetch:mmg';

    // Description
    protected $description = 'Exécute le job FetchMmgCdr directement sans passer par la queue';

    public function handle()
    {
        // Instancie et exécute le job immédiatement
        $job = new FetchMmgCdr();
        $job->handle();

        $this->info('Job FetchMmgCdr exécuté avec succès !');
    }
}