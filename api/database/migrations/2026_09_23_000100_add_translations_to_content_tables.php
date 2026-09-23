<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Tablas con textos que se muestran en la portada. */
    private const TABLAS = ['ranches', 'services', 'gallery_images', 'pricing_rules', 'testimonials'];

    /**
     * Versión en inglés del sitio. Cada tabla guarda sus traducciones en una
     * columna JSON ({"en": {"campo": "…"}}) en lugar de columnas `*_en`: así
     * sumar otro idioma no pide migrar de nuevo. Las reservas registran en qué
     * idioma se pidieron, para contestarle a la persona en el mismo.
     */
    public function up(): void
    {
        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->json('translations')->nullable();
            });
        }

        Schema::table('reservations', function (Blueprint $table) {
            $table->string('locale', 5)->default('es');
        });
    }

    public function down(): void
    {
        foreach (self::TABLAS as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->dropColumn('translations');
            });
        }

        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn('locale');
        });
    }
};
