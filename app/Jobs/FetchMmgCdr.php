<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Storage;

class FetchMmgCdr
{
    public function handle()
    {
        $sourceFtp = Storage::disk('ftp_local');
        $localFtp  = Storage::disk('cdr_storage');

        $files = $sourceFtp->files('mmg');

        foreach ($files as $filePath) {

            if (!str_ends_with($filePath, '.csv')) {
                continue;
            }

            $filename = basename($filePath);

            // Copier fichier vers stockage local
            $content = $sourceFtp->get($filePath);
            $localFtp->put('mmg/' . $filename, $content);

            // Déplacer vers dossier processed
            $sourceFtp->move(
                'mmg/' . $filename,
                'mmg/processed/' . $filename
            );
        }
    }
}