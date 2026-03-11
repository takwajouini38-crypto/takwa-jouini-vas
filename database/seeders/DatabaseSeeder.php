<?php

namespace Database\Seeders;
use App\Models\JobTask;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
       JobTask::create(['name' => 'Loading CDR MMG', 'type' => 'loading_mmg', 'status' => 'stopped']);
       JobTask::create(['name' => 'Loading CDR OCC', 'type' => 'loading_occ', 'status' => 'stopped']);
       JobTask::create(['name' => 'Agg CDR MMG', 'type' => 'agg_mmg', 'status' => 'stopped']);
       JobTask::create(['name' => 'Agg CDR OCC', 'type' => 'agg_occ', 'status' => 'stopped']);
       JobTask::create(['name' => 'Suppression CDR', 'type' => 'suppression', 'status' => 'stopped']);
       JobTask::create(['name' => 'Fetch CDR MMG', 'type' => 'fetch_mmg', 'status' => 'stopped']);
       JobTask::create(['name' => 'Fetch CDR OCC', 'type' => 'fetch_occ', 'status' => 'stopped']);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
