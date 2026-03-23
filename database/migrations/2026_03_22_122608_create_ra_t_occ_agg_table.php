<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ra_t_occ_agg', function (Blueprint $table) {

            $table->string('b_msisdn', 200)->nullable();

            $table->date('start_date')->nullable();
            $table->unsignedTinyInteger('start_hour')->nullable(); // NUMBER(2,0)

            $table->string('call_type', 20)->nullable();
            $table->string('event_type', 20)->nullable();
            $table->string('subscriber_type', 30)->nullable();

            $table->string('keyword', 100)->nullable();

            $table->integer('cdr_count')->nullable(); // NUMBER
            $table->decimal('charge_amount', 20, 5)->nullable(); // NUMBER sans précision → safe decimal

        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ra_t_occ_agg');
    }
};