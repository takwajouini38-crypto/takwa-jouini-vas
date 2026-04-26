<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ra_t_mmg_agg', function (Blueprint $table) {
            // 1. On s'assure que la colonne est indexée (essentiel pour Oracle)
            $table->index('service_type'); 

            // 2. On ajoute la contrainte
            $table->foreign('service_type')
                  ->references('keyword')
                  ->on('services_sms_plus')
                  ->onUpdate('cascade')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('ra_t_mmg_agg', function (Blueprint $table) {
            $table->dropForeign(['service_type']);
            $table->dropIndex(['service_type']);
        });
    }
};