<?php

namespace App\Jobs; // IMPORTANT

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\DB;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class PurgeCdrDetail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        // Supprime les CDR de plus de 90 jours
        $deletedMmg = DB::affectingStatement("
            DELETE FROM RA_T_MMG_CDR_DETAIL
            WHERE START_DATE < SYSDATE - 90
        ");

        $deletedOcc = DB::affectingStatement("
            DELETE FROM RA_T_OCC_CDR_DETAIL
            WHERE START_DATE < SYSDATE - 90
        ");

        echo "MMG supprimés : $deletedMmg\n";
        echo "OCC supprimés : $deletedOcc\n";
    }
}