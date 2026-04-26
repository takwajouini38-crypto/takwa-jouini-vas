<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ra_t_mmg_agg', function (Blueprint $table) {

            // Pas de id (table d’agrégation Oracle)
            $table->string('b_msisdn', 50)->nullable();

            $table->date('start_date')->nullable();
            $table->integer('start_hour')->nullable(); // NUMBER(2,0)

            $table->string('event_type', 50)->nullable();
            $table->string('call_type', 50)->nullable();
            $table->string('event_status', 50)->nullable();
            $table->string('subscriber_type', 50)->nullable();
            $table->string('service_type', 50)->nullable();

            $table->integer('cdr_count')->nullable(); // NUMBER
            // 2. On déclare la contrainte de clé étrangère
        $table->foreign('service_type')
              ->references('keyword')    // La colonne cible
              ->on('services_sms_plus') // La table cible
              ->onUpdate('cascade')      // Si le keyword change, il se met à jour ici
              ->onDelete('set null');    // Si le service est supprimé, on garde le trafic à NULL

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ra_t_mmg_agg');
    }
};