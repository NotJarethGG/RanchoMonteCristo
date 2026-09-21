<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Motor de precios por reglas. El precio final se resuelve aplicando,
     * por orden de prioridad, la regla `base` y luego los modificadores
     * que apliquen a la fecha / cantidad de personas.
     */
    public function up(): void
    {
        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ranch_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type', 30);            // base|weekday|weekend|date_range|season|holiday|per_person
            $table->string('amount_type', 20);     // fixed|per_person|percentage
            $table->decimal('amount', 12, 2)->default(0);

            // Alcance de la regla (todo nullable = aplica siempre)
            $table->date('starts_on')->nullable();
            $table->date('ends_on')->nullable();
            $table->json('weekdays')->nullable();  // [0..6] 0 = domingo
            $table->unsignedSmallInteger('min_guests')->nullable();
            $table->unsignedSmallInteger('max_guests')->nullable();

            $table->unsignedSmallInteger('priority')->default(100);  // Menor = se evalúa primero
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'type', 'priority']);
            $table->index(['starts_on', 'ends_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pricing_rules');
    }
};
