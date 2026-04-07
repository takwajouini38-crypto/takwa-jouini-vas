<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;
use App\Models\JobTask;
use App\Jobs\FetchMmgCdr;
use App\Jobs\FetchOccCdr;
use App\Jobs\LoadMmgCdr;
use App\Jobs\LoadOccCdr;
use App\Jobs\AggregateMmgCdr;
use App\Jobs\AggregateOccCdr;
use App\Jobs\PurgeCdrDetail;
use Illuminate\Support\Facades\Log;

class RunCdrDailyEtl extends Command
{
    protected $signature = 'cdr:run-etl';
    protected $description = 'Orchestration complète de la chaîne ETL avec mise à jour des statuts Oracle';

   public function handle()
{
    $this->info('--- Initialisation de la Séquence ETL Tunisie Telecom ---');

    // IDs de tes jobs dans la table RA_JOB_TASKS
    $jobIds = [6, 7, 1, 2, 3, 4, 5]; 

    try {
        // ✅ 1. On remet tout à 'pending' pour l'interface React
        JobTask::whereIn('id', $jobIds)->update([
            'status'     => 'pending',
            'updated_at' => now(),
        ]);

        $this->info('Statuts réinitialisés. Lancement de la chaîne séquentielle...');

        // ✅ 2. La Chaîne Logique (L'ordre est ici !)
        Bus::chain([
            // Étape A : Téléchargement (FETCH)
            new \App\Jobs\FetchMmgCdr(6), 
            new \App\Jobs\FetchOccCdr(7), 

            // Étape B : Insertion dans TMP et DETAIL (LOAD)
            new \App\Jobs\LoadMmgCdr(1),  
            new \App\Jobs\LoadOccCdr(2),  

            // Étape C : Calculs Statistiques (AGGREGATE)
            new \App\Jobs\AggregateMmgCdr(3), 
            new \App\Jobs\AggregateOccCdr(4), 

            // Étape D : Nettoyage (PURGE)
            new \App\Jobs\PurgeCdrDetail(5),  
        ])->dispatch();

        $this->info('Succès : La chaîne s’exécutera dans l’ordre prévu.');

    } catch (\Exception $e) {
        $this->error('Erreur de lancement : ' . $e->getMessage());
    }
}
}