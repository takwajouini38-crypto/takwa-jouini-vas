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
       Schema::create('ftp_settings', function (Blueprint $table) {
    $table->id();
    $table->string('name')->nullable(); // ex: FTP Principal
    $table->string('host');
    $table->integer('port')->default(21);
    $table->string('username');
    $table->string('password');
    $table->boolean('is_active')->default(true);
    $table->boolean('is_default')->default(false);
    $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ftp_settings');
    }
};
