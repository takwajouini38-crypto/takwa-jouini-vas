<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\ServiceSmsPlus;
use App\Models\RaTMmgAgg;
use App\Models\Alert;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;
use App\Notifications\AlertDetectionNotification;

class CheckTrafficAlerts extends Command
{
    // On change la signature pour qu'elle soit plus simple à appeler
    protected $signature = 'traffic:check-alerts';
    protected $description = 'Détecte les majorations de revenus anormales (>20%) sur les services SMS+';

    public function handle()
    {
        $today = Carbon::today()->toDateString();
        $yesterday = Carbon::yesterday()->toDateString();

        $this->info("Démarrage de l'analyse des alertes pour le : $today");

        // 1. On récupère tous les services SMS+ actifs
        $services = ServiceSmsPlus::active()->get();

        foreach ($services as $service) {
            // 2. Récupérer le volume MMG (Réseau) d'aujourd'hui
            $currentVolume = RaTMmgAgg::where('service_type', $service->keyword)
                ->whereDate('start_date', $today)
                ->sum('cdr_count');

            // 3. Récupérer le volume MMG d'hier (J-1)
            $previousVolume = RaTMmgAgg::where('service_type', $service->keyword)
                ->whereDate('start_date', $yesterday)
                ->sum('cdr_count');

            // 4. Calculer l'augmentation si on a des données pour hier
            if ($previousVolume > 0) {
                $increase = (($currentVolume - $previousVolume) / $previousVolume) * 100;

                // Si l'augmentation dépasse le seuil de 20%
                if ($increase >= 20) {
                    
                    // 5. Créer l'alerte dans la base pour l'historique
                    $alert = Alert::create([
                        'service_name'   => $service->nom_service,
                        'provider'       => $service->nom_fournisseur,
                        'avg_volume'     => $previousVolume,
                        'current_volume' => $currentVolume,
                        'increase_pct'   => round($increase, 2),
                        'detected_at'    => now(),
                    ]);

                    $this->warn("Alerte détectée : {$service->nom_service} (+{$alert->increase_pct}%)");

                    // 6. Notification par email à l'analyste Business
                    // Note : Assure-toi d'avoir créé la notification 'AlertDetectionNotification'
                    try {
                        Notification::route('mail', 'analyste-business@tunisietelecom.tn')
                            ->notify(new AlertDetectionNotification($alert));
                    } catch (\Exception $e) {
                        $this->error("Erreur lors de l'envoi de l'email : " . $e->getMessage());
                    }
                }
            }
        }

        $this->info("Analyse terminée.");
    }
}