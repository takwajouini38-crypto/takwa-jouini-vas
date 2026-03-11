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
        Schema::create('services_sms_plus', function (Blueprint $table) {
            $table->unsignedBigInteger('ID')->autoIncrement(); // auto increment
            $table->string('NOM_FOURNISSEUR', 100);
            $table->string('NOM_SERVICE', 100);
            $table->string('NUMERO_COURT', 20)->nullable();
            $table->string('KEYWORD', 50)->nullable();
            $table->string('TYPE', 50)->nullable();       // correspond à votre colonne TYPE
            $table->decimal('PRIX', 6, 2)->nullable();    // 6 chiffres au total, 2 décimales
            // Si vous souhaitez des timestamps, décommentez la ligne suivante
             $table->timestamps(); // created_at et updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services_sms_plus');
    }
};