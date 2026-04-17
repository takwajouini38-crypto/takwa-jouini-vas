<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void {
    Schema::table('services_sms_plus', function (Blueprint $table) {
        $table->dropColumn('nom_fournisseur');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('services_sms_plus', function (Blueprint $table) {
            //
        });
    }
};
