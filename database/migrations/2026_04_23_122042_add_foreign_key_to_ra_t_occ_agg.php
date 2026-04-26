<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ra_t_occ_agg', function (Blueprint $table) {
            // 1. On crée d'abord l'index pour optimiser la recherche
            // (Si l'index existe déjà, commente cette ligne)
            $table->index('keyword');

            // 2. On ajoute la contrainte de clé étrangère
            $table->foreign('keyword')
                  ->references('keyword')
                  ->on('services_sms_plus')
                  ->onUpdate('cascade')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ra_t_occ_agg', function (Blueprint $table) {
            // On supprime la clé étrangère d'abord
            $table->dropForeign(['keyword']);
            // Puis l'index
            $table->dropIndex(['keyword']);
        });
    }
};