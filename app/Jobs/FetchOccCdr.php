<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class FetchOccCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $sourceFtp = Storage::disk('ftp_local');
        $localFtp  = Storage::disk('cdr_storage');

        $files = $sourceFtp->files('occ');

        foreach ($files as $filePath) {

            if (!str_ends_with($filePath, '.csv')) continue;

            $filename = basename($filePath);

            $content = $sourceFtp->get($filePath);

            $localFtp->put('occ/' . $filename, $content);

          // Déplacer vers dossier processed
            $sourceFtp->move(
                'occ/' . $filename,
                'occ/processed/' . $filename
            );
        }
    }
}