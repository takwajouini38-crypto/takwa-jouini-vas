<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services_sms_plus', function (Blueprint $table) {
            // 1. On ajoute la colonne provider_id (unsignedBigInteger pour correspondre à un ID standard)
            // On la place après une colonne existante pour garder une table organisée
            $table->unsignedBigInteger('provider_id')->nullable()->after('id');

            // 2. On définit la clé étrangère qui pointe vers la table service_providers
            $table->foreign('provider_id')
                  ->references('id')
                  ->on('service_providers')
                  ->onDelete('cascade'); // Si on supprime un fournisseur, ses services sautent aussi
        });
    }

    public function down(): void
    {
        Schema::table('service_sms_plus', function (Blueprint $table) {
            // On supprime la contrainte puis la colonne si on fait un rollback
            $table->dropForeign(['provider_id']);
            $table->dropColumn('provider_id');
        });
    }
};