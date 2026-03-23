<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ra_t_occ_cdr_detail', function (Blueprint $table) {

            $table->string('datasource', 20); // NOT NULL
            $table->string('a_msisdn', 200); // NOT NULL
            $table->string('b_msisdn', 200)->nullable();

            $table->date('start_date'); // NOT NULL
            $table->unsignedTinyInteger('start_hour')->nullable(); // NUMBER(2,0)

            $table->string('apn', 50); // NOT NULL
            $table->string('call_type', 20); // NOT NULL
            $table->string('event_type', 20); // NOT NULL
            $table->string('subscriber_type', 30); // NOT NULL
            $table->string('roaming_type', 10); // NOT NULL
            $table->string('partner', 20); // NOT NULL

            $table->decimal('charge_amount', 20, 5)->nullable();

            $table->string('keyword', 100)->default('_N');
            $table->string('orig_start_time', 70)->nullable();

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ra_t_occ_cdr_detail');
    }
};