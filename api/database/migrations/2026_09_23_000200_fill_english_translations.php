<?php

use App\Support\EnglishDefaults;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Carga la traducción al inglés del contenido que ya está en la base, para
     * que la versión en inglés salga completa desde el primer despliegue. Solo
     * traduce textos que siguen iguales a los originales y nunca pisa lo que
     * el propietario haya escrito.
     */
    public function up(): void
    {
        EnglishDefaults::apply();
    }

    public function down(): void
    {
        // Las traducciones se van con la columna en la migración anterior.
    }
};
