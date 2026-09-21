<?php

namespace Database\Seeders;

use App\Models\Ranch;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    /**
     * Imágenes placeholder (URLs externas). Al subir fotos reales desde el
     * dashboard se guardan en storage/app/public/gallery y `path` pasa a ser relativa.
     */
    public function run(): void
    {
        $ranch = Ranch::primary();

        $images = [
            ['title' => 'Vista del rancho al atardecer', 'category' => 'rancho', 'is_featured' => true, 'path' => 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80'],
            ['title' => 'Rancho techado principal', 'category' => 'rancho', 'path' => 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=1600&q=80'],
            ['title' => 'Mesas listas para el evento', 'category' => 'eventos', 'path' => 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1600&q=80'],
            ['title' => 'Zona de parrillas', 'category' => 'parrilla', 'path' => 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80'],
            ['title' => 'Áreas verdes', 'category' => 'areas-verdes', 'path' => 'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?auto=format&fit=crop&w=1600&q=80'],
            ['title' => 'Camino de entrada', 'category' => 'rancho', 'path' => 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80'],
            ['title' => 'Celebración en el rancho', 'category' => 'eventos', 'path' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80'],
            ['title' => 'Montaña alrededor', 'category' => 'areas-verdes', 'path' => 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80'],
            ['title' => 'Cocina y servicio', 'category' => 'cocina', 'path' => 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1600&q=80'],
        ];

        foreach ($images as $index => $image) {
            // La clave es el título, no la URL: así cambiar la foto actualiza
            // la fila en vez de crear una duplicada.
            $ranch->galleryImages()->updateOrCreate(
                ['title' => $image['title']],
                [
                    ...$image,
                    'alt' => $image['title'],
                    'is_active' => true,
                    'sort_order' => $index,
                ],
            );
        }
    }
}
