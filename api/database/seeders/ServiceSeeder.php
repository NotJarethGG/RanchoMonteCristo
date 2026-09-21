<?php

namespace Database\Seeders;

use App\Models\Ranch;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    /**
     * Datos de ejemplo: el propietario los edita/desactiva desde el dashboard.
     * `icon` corresponde al nombre del icono en lucide-react.
     */
    public function run(): void
    {
        $ranch = Ranch::primary();

        $services = [
            ['name' => 'Rancho techado', 'icon' => 'home', 'description' => 'Espacio techado con mesas y sillas para todo el grupo, llueva o truene.'],
            ['name' => 'Parrilla', 'icon' => 'flame', 'description' => 'Zona de parrillas de obra con mesones de preparación y lavado.'],
            ['name' => 'Cocina equipada', 'icon' => 'chef-hat', 'description' => 'Cocina con refrigeradora, microondas y espacio para el catering.'],
            ['name' => 'Parqueo privado', 'icon' => 'car-front', 'description' => 'Parqueo interno para 30 vehículos dentro de la propiedad.'],
            ['name' => 'Áreas verdes', 'icon' => 'trees', 'description' => 'Zonas abiertas para juegos, fotografías y actividades al aire libre.'],
            ['name' => 'Baños y duchas', 'icon' => 'shower-head', 'description' => 'Servicios sanitarios separados para hombres y mujeres, con duchas.'],
            ['name' => 'WiFi', 'icon' => 'wifi', 'description' => 'Internet inalámbrico en el área del rancho principal.'],
        ];

        foreach ($services as $index => $service) {
            $ranch->services()->updateOrCreate(
                ['slug' => Str::slug($service['name'])],
                [...$service, 'is_active' => true, 'sort_order' => $index],
            );
        }
    }
}
