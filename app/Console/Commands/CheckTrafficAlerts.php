<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ServiceSmsPlus;
use App\Models\RaTMmgAgg;
use App\Models\Alert;
use Carbon\Carbon;
// 1. Importation de la façade Notification et de votre classe
use Illuminate\Support\Facades\Notification;
use App\Notifications\AlertDetectionNotification;

class CheckTrafficAlerts extends Command
{
    protected $signature = 'traffic:check-alerts';
    protected $description = 'Détecte une hausse sur les dernières données disponibles';

    public function handle()
    {
        $this->info("Démarrage de l'analyse sur les données HISTORIQUES...");

        $lastDate = \App\Models\RaTMmgAgg::max('start_date');

        if (!$lastDate) {
            $this->error("Aucune donnée trouvée dans la table RA_T_MMG_AGG.");
            return;
        }

        $referenceDate = \Carbon\Carbon::parse($lastDate);
        $targetDate = $referenceDate->toDateString(); 
        $sevenDaysAgo = $referenceDate->copy()->subDays(7)->toDateString();
        $yesterday = $referenceDate->copy()->subDay()->toDateString();

        $this->info("Date d'analyse : " . $targetDate);

        // Optionnel : Utiliser un groupBy pour éviter les doublons si nécessaire
        $services = \App\Models\ServiceSmsPlus::all();

        foreach ($services as $service) {
            $keyword = trim($service->keyword);

            $currentVolume = \App\Models\RaTMmgAgg::whereRaw("TRIM(service_type) = ?", [$keyword])
                ->whereRaw("TRUNC(start_date) = TO_DATE(?, 'YYYY-MM-DD')", [$targetDate])
                ->sum('cdr_count') ?: 0;

            $avgVolume = \App\Models\RaTMmgAgg::whereRaw("TRIM(service_type) = ?", [$keyword])
                ->whereRaw("TRUNC(start_date) BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [
                    $sevenDaysAgo, 
                    $yesterday
                ])
                ->avg('cdr_count') ?: 0;

            $this->line("Service: <info>{$keyword}</info> | Vol: <comment>{$currentVolume}</comment> | Moy: <comment>" . round($avgVolume, 2) . "</comment>");

            if ($avgVolume > 0) {
                $increase = (($currentVolume - $avgVolume) / $avgVolume) * 100;

                if ($increase >= 20) {
                    $this->warn("   => !!! ALERTE : +{$increase}% détectée !!!");
                    
                    // 2. Création de l'alerte
                    $alert = Alert::create([
                        'service_name'   => $service->service_name,
                        'provider'       => $service->provider_id,
                        'avg_volume'     => round($avgVolume, 0),
                        'current_volume' => $currentVolume,
                        'increase_pct'   => round($increase, 2),
                        'detected_at'    => now(),
                    ]);

                    // 3. Envoi de la notification par mail
                    try {
                        // Remplacez par l'email réel de destination
                        Notification::route('mail', 'takwajouini38@gmail.com')
                            ->notify(new AlertDetectionNotification($alert));
                            
                        $this->info("      -> Notification mail envoyée.");
                    } catch (\Exception $e) {
                        $this->error("      -> Erreur d'envoi mail : " . $e->getMessage());
                    }
                }
            }
        }
    }
}