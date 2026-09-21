<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();                       // RMC-2025-0001
            $table->foreignId('ranch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            // Evento
            $table->date('event_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('guests')->default(1);
            $table->string('event_type', 80)->nullable();
            $table->text('notes')->nullable();            // Comentarios del cliente
            $table->text('internal_notes')->nullable();   // Notas privadas del staff

            // Estado y trazabilidad
            $table->string('status', 20)->default('pending');   // pending|confirmed|cancelled|completed
            $table->string('source', 20)->default('web');       // web|manual|phone|whatsapp
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();

            // Dinero (montos congelados al momento de cotizar)
            $table->decimal('total_amount', 12, 2)->default(0);
            $table->decimal('deposit_amount', 12, 2)->default(0);   // Adelanto requerido
            $table->json('pricing_breakdown')->nullable();          // Desglose calculado

            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_date', 'status']);
            $table->index(['status', 'created_at']);
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
