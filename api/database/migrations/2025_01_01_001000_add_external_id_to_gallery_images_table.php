<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Identificador de la imagen en el servicio externo (el `public_id` de
     * Cloudinary). Hace falta para poder borrarla de allá cuando se elimina
     * de la galería; sin esto quedarían archivos huérfanos acumulándose.
     */
    public function up(): void
    {
        Schema::table('gallery_images', function (Blueprint $table) {
            $table->string('external_id')->nullable()->after('path');
        });
    }

    public function down(): void
    {
        Schema::table('gallery_images', function (Blueprint $table) {
            $table->dropColumn('external_id');
        });
    }
};
