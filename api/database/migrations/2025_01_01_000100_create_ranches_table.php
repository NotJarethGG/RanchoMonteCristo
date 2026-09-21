<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Configuración editable del rancho (singleton en la práctica, pero
     * modelado como tabla para soportar varias propiedades a futuro).
     */
    public function up(): void
    {
        Schema::create('ranches', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->text('about')->nullable();

            // Contacto
            $table->string('phone', 40)->nullable();
            $table->string('whatsapp', 40)->nullable();
            $table->string('email')->nullable();

            // Ubicación
            $table->string('address')->nullable();
            $table->string('city', 120)->nullable();
            $table->string('province', 120)->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('google_maps_url')->nullable();

            // Operación
            $table->unsignedSmallInteger('capacity')->default(0);
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->json('schedule')->nullable();       // Horarios por día
            $table->json('socials')->nullable();        // {facebook, instagram, tiktok, ...}
            $table->json('event_types')->nullable();    // Tipos de evento aceptados
            $table->json('areas')->nullable();          // Áreas disponibles
            $table->text('policies')->nullable();

            $table->string('hero_image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ranches');
    }
};
