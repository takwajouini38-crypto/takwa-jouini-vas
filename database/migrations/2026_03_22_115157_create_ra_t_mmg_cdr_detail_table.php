<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ra_t_mmg_cdr_detail', function (Blueprint $table) {

            // Pas d'id (table Oracle sans PK)
            $table->string('ne', 50)->nullable();
            $table->string('a_msisdn', 50)->nullable();
            $table->string('b_msisdn', 50)->nullable();

            $table->date('start_date')->nullable();
            $table->integer('start_hour')->nullable(); // NUMBER(2,0)

            $table->string('event_type', 50)->nullable();
            $table->string('event_type_orig', 50)->nullable();
            $table->string('call_type', 50)->nullable();
            $table->string('event_status', 50)->nullable();
            $table->string('subscriber_type', 50)->nullable();
            $table->string('service_type', 50)->nullable();

            $table->string('orig_start_time', 50)->nullable();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ra_t_mmg_cdr_detail');
    }
};