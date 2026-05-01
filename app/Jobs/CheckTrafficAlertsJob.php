<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\ServiceSmsPlus;
use App\Models\RaTMmgAgg;
use App\Models\Alert;
use Illuminate\Support\Facades\Notification;
use App\Notifications\AlertDetectionNotification;
use Illuminate\Support\Facades\Log;

class CheckTrafficAlertsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Le nombre de fois que le job peut être tenté.
     */
    public $tries = 3;
    public function __construct()
    {
        // 🔥 FORCE CE JOB SUR LA QUEUE 'traffic'
        // Cela permet de le séparer de la queue 'etl' utilisée pour les CDR
        $this->onQueue('traffic'); 
    }

    public function handle()
    {
        $lastDate = RaTMmgAgg::max('start_date');

        if (!$lastDate) {
            Log::warning("Job Traffic: Aucune donnée trouvée.");
            return;
        }

        $referenceDate = \Carbon\Carbon::parse($lastDate);
        $targetDate = $referenceDate->toDateString();
        $sevenDaysAgo = $referenceDate->copy()->subDays(7)->toDateString();
        $yesterday = $referenceDate->copy()->subDay()->toDateString();

        $services = ServiceSmsPlus::all();

        foreach ($services as $service) {
            $keyword = trim($service->keyword);

            $currentVolume = RaTMmgAgg::whereRaw("TRIM(service_type) = ?", [$keyword])
                ->whereRaw("TRUNC(start_date) = TO_DATE(?, 'YYYY-MM-DD')", [$targetDate])
                ->sum('cdr_count') ?: 0;

            $avgVolume = RaTMmgAgg::whereRaw("TRIM(service_type) = ?", [$keyword])
                ->whereRaw("TRUNC(start_date) BETWEEN TO_DATE(?, 'YYYY-MM-DD') AND TO_DATE(?, 'YYYY-MM-DD')", [
                    $sevenDaysAgo, 
                    $yesterday
                ])
                ->avg('cdr_count') ?: 0;

            if ($avgVolume > 0) {
                $increase = (($currentVolume - $avgVolume) / $avgVolume) * 100;

                if ($increase >= 20) {
                    $alert = Alert::create([
                        'service_name'   => $service->service_name,
                        'provider'       => $service->provider_id,
                        'avg_volume'     => round($avgVolume, 0),
                        'current_volume' => $currentVolume,
                        'increase_pct'   => round($increase, 2),
                        'detected_at'    => now(),
                    ]);

                    Notification::route('mail', 'takwajouini38@gmail.com')
                        ->notify(new AlertDetectionNotification($alert));
                }
            }
        }
    }
}