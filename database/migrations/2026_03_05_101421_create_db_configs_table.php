<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('db_configs', function (Blueprint $table) {
            $table->id();
            $table->string('host');
            $table->integer('port')->default(1521);
            $table->string('service_name');
            $table->string('username');
            $table->text('password'); // sera chiffré
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('db_configs');
    }
};