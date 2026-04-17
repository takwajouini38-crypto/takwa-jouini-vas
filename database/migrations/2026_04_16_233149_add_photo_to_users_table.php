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
        Schema::table('users', function (Blueprint $table) {
            // On ajoute une colonne 'photo' qui peut être vide (nullable)
            // On la place après la colonne 'email' pour une structure propre
            $table->string('photo')->nullable()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Permet de supprimer la colonne en cas de rollback
            $table->dropColumn('photo');
        });
    }
};