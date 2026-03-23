<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;

class FetchMmgCdr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        Log::info("Fetch MMG - Start");

        try {

            $sourceFtp = Storage::disk('ftp_local');
            $localFtp  = Storage::disk('cdr_storage');

            $files = $sourceFtp->files('mmg');

            foreach ($files as $filePath) {

                if (!str_ends_with($filePath, '.csv')) continue;

                $filename = basename($filePath);

                $content = $sourceFtp->get($filePath);
                $localFtp->put('mmg/' . $filename, $content);

                $sourceFtp->move(
                    'mmg/' . $filename,
                    'mmg/processed/' . $filename
                );
            }

            Log::info("Fetch MMG - End");

        } catch (\Exception $e) {
            Log::error("Erreur Fetch MMG : " . $e->getMessage());
        }
    }
}