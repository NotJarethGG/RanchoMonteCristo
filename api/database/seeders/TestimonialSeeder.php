<?php

namespace Database\Seeders;

use App\Models\Ranch;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $ranch = Ranch::primary();

        $testimonials = [
            [
                'author_name' => 'María Fernanda Solís',
                'event_type' => 'Cumpleaños de 15',
                'rating' => 5,
                'content' => 'Todo salió perfecto. El lugar es precioso, muy limpio y el trato fue excelente desde la primera llamada. Nuestros invitados no querían irse.',
                'event_date' => '2025-06-14',
            ],
            [
                'author_name' => 'Jorge Álvarez',
                'event_type' => 'Reunión de empresa',
                'rating' => 5,
                'content' => 'Hicimos la actividad anual de la empresa con 80 personas. Amplio, ordenado y con parqueo para todos. Repetimos sin duda.',
                'event_date' => '2025-04-26',
            ],
            [
                'author_name' => 'Familia Ureña Vargas',
                'event_type' => 'Reunión familiar',
                'rating' => 5,
                'content' => 'Las zonas verdes fueron lo mejor para los chiquitos. Nos dejaron el rancho para nosotros solos todo el día.',
                'event_date' => '2025-02-09',
            ],
            [
                'author_name' => 'Andrea y Luis',
                'event_type' => 'Boda',
                'rating' => 5,
                'content' => 'Buscábamos un lugar natural y con vista, y este superó lo que teníamos en mente. Las fotos al atardecer quedaron increíbles.',
                'event_date' => '2024-12-07',
            ],
        ];

        foreach ($testimonials as $index => $testimonial) {
            $ranch->testimonials()->updateOrCreate(
                ['author_name' => $testimonial['author_name']],
                [...$testimonial, 'is_published' => true, 'sort_order' => $index],
            );
        }
    }
}
