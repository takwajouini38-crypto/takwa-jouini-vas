<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('services_sms_plus', function (Blueprint $table) {
            $table->renameColumn('prix', 'price');
        });
    }

    public function down()
    {
        Schema::table('services_sms_plus', function (Blueprint $table) {
            $table->renameColumn('price', 'prix');
        });
    }
};