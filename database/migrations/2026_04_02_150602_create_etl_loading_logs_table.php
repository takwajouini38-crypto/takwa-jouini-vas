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
    Schema::create('etl_loading_logs', function (Blueprint $table) {
        $table->id();
        $table->string('file_name');      
        $table->string('flux_type');      
        $table->integer('lines_count');   
        $table->string('status');         
        $table->text('error_message')->nullable();
        $table->timestamp('loaded_at')->useCurrent();
        // Pas besoin de $table->timestamps() si vous utilisez loaded_at
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('etl_loading_logs');
    }
};
