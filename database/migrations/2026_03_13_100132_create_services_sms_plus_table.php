<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services_sms_plus', function (Blueprint $table) {
            $table->id();
            $table->string('nom_service');
            $table->string('nom_fournisseur');
            $table->string('numero_court');
            $table->string('keyword')->nullable();
            $table->string('type');
            $table->decimal('prix',8,2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services_sms_plus');
    }
};