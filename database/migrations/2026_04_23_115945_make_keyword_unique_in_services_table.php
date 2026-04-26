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
    Schema::table('services_sms_plus', function (Blueprint $table) {
        // Cette ligne dit à Oracle : "Je garantis que KEYWORD est unique"
        $table->unique('keyword'); 
    });
}

public function down(): void
{
    Schema::table('services_sms_plus', function (Blueprint $table) {
        $table->dropUnique(['keyword']);
    });
}

  
}
    ;
