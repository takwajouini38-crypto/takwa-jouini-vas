<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('alerts', function (Blueprint $table) {
        $table->id();
        $table->string('service_name'); 
        $table->string('provider');     
        $table->bigInteger('avg_volume'); 
        $table->bigInteger('current_volume'); 
        $table->float('increase_pct');  
        $table->text('motif')->nullable(); 
        $table->timestamp('detected_at'); 
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
