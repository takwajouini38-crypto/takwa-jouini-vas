<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\RaTOccAgg;
use App\Models\RaTMmgAgg;
use App\Models\ServiceSmsPlus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FakeDataSeeder extends Seeder
{
    public function run()
    {
        DB::table('ra_t_occ_agg')->delete();
        DB::table('ra_t_mmg_agg')->delete();

        $keywords = ServiceSmsPlus::pluck('keyword')->toArray();

        if (empty($keywords)) {
            $this->command->error("La table services_sms_plus est vide !");
            return;
        }

        // On crée une liste de 50 numéros "clients" différents pour Tunisie Télécom
        // Les préfixes courants : 98, 97, 96, 95, 94, 93, 92...
        $prefixes = ['98', '97', '96', '95', '94', '99'];
        $testMsisdns = [];
        for ($i = 0; $i < 50; $i++) {
            $testMsisdns[] = '216' . $prefixes[array_rand($prefixes)] . rand(100000, 999999);
        }

        $occData = [];
        $mmgData = [];
        $startDate = Carbon::create(2026, 1, 1);
        $endDate = Carbon::create(2026, 3, 25);

        $this->command->info("Génération des données avec MSISDN variés...");

        for ($date = $startDate; $date->lte($endDate); $date->addDay()) {
            foreach ($keywords as $kw) {
                
                // On choisit un MSISDN au hasard dans notre liste pour chaque transaction
                $randomMsisdn = $testMsisdns[array_rand($testMsisdns)];

                // --- OCC (Revenus) ---
                $amount = rand(5, 150) + (rand(0, 9) / 10); 
                $occData[] = [
                    'b_msisdn'        => $randomMsisdn,
                    'start_date'      => $date->format('Y-m-d'),
                    'start_hour'      => (int)rand(0, 23),
                    'keyword'         => $kw,
                    'charge_amount'   => (string)$amount, 
                    'subscriber_type' => rand(0, 1) ? 'PREPAID' : 'HYB',
                    'event_type'      => '74',
                    'call_type'       => 'VAS',
                    'cdr_count'       => (int)rand(1, 5), // Un utilisateur fait peu d'actes simultanés
                ];

                // --- MMG (Volumes) ---
                $mmgData[] = [
                    'b_msisdn'        => $randomMsisdn,
                    'start_date'      => $date->format('Y-m-d'),
                    'start_hour'      => (int)rand(0, 23),
                    'service_type'    => $kw,
                    'cdr_count'       => (int)rand(1, 10),
                    'subscriber_type' => rand(0, 1) ? 'PREPAID' : 'HYB',
                    'event_type'      => '74',
                    'call_type'       => 'VAS',
                    'event_status'    => 'Success',
                ];
            }

            // Insertion par paquets pour la performance
            if (count($occData) >= 100) {
                RaTOccAgg::insert($occData);
                RaTMmgAgg::insert($mmgData);
                $occData = [];
                $mmgData = [];
            }
        }

        // Dernier paquet
        if (!empty($occData)) {
            RaTOccAgg::insert($occData);
            RaTMmgAgg::insert($mmgData);
        }

        $this->command->info("Succès ! " . count($testMsisdns) . " numéros différents ont été utilisés.");
        $this->command->warn("Exemple de numéro généré pour vos tests : " . $testMsisdns[0]);
    }
}