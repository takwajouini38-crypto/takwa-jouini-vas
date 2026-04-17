<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('services_sms_plus', function (Blueprint $table) {
            $table->renameColumn('nom_service', 'service_name');
            $table->renameColumn('numero_court', 'short_code');
        });
    }

    public function down()
    {
        Schema::table('services_sms_plus', function (Blueprint $table) {
            $table->renameColumn('service_name', 'nom_service');
            $table->renameColumn('short_code', 'numero_court');
        });
    }
};
