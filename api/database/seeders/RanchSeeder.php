<?php

namespace Database\Seeders;

use App\Models\Ranch;
use Illuminate\Database\Seeder;

class RanchSeeder extends Seeder
{
    public function run(): void
    {
        Ranch::updateOrCreate(
            ['slug' => 'rancho-monte-cristo'],
            [
                'name' => 'Rancho Monte Cristo',
                'tagline' => 'Un lugar para crear momentos inolvidables',
                'description' => 'Disfrutá de nuestro rancho para tus eventos, reuniones y momentos especiales.',
                'about' => 'Rancho Monte Cristo es una finca privada en Nicoya, con zonas verdes amplias, '
                    .'rancho techado y todas las comodidades para recibir a tu gente. '
                    .'Alquilamos el lugar completo, sin compartirlo con otros grupos, para que tu evento sea realmente tuyo.',

                'phone' => '8934-3847',
                'whatsapp' => '50689343847',
                'email' => 'reservas@ranchomontecristo.com',

                'address' => '1,5 km al oeste de la Escuela Saúl Cárdenas (Plus Code 4GJP+W47)',
                'city' => 'Nicoya',
                'province' => 'Guanacaste',
                'latitude' => 10.132288,
                'longitude' => -85.464703,
                'google_maps_url' => 'https://www.google.com/maps/search/?api=1&query=10.132288,-85.464703',

                'capacity' => 120,
                'check_in_time' => '09:00',
                'check_out_time' => '20:00',
                'schedule' => [
                    ['day' => 'Lunes a jueves', 'hours' => '9:00 a.m. – 6:00 p.m.'],
                    ['day' => 'Viernes y sábado', 'hours' => '9:00 a.m. – 10:00 p.m.'],
                    ['day' => 'Domingo', 'hours' => '9:00 a.m. – 8:00 p.m.'],
                ],
                'socials' => [
                    'facebook' => 'https://facebook.com/ranchomontecristo',
                    'instagram' => 'https://instagram.com/ranchomontecristo',
                    'tiktok' => null,
                ],
                'event_types' => [
                    'Cumpleaños', 'Bodas', 'Aniversarios', 'Reuniones familiares',
                    'Eventos de empresa', 'Graduaciones', 'Baby shower', 'Paseos de grupo',
                ],
                'areas' => [
                    'Rancho techado principal', 'Zona de parrillas',
                    'Cocina equipada', 'Áreas verdes', 'Parqueo privado',
                ],
                'policies' => "• La fecha se aparta con un adelanto del 50%.\n"
                    ."• El saldo se cancela el día del evento.\n"
                    ."• Se permite música hasta la hora acordada de salida.\n"
                    ."• No se permiten mascotas sin autorización previa.\n"
                    .'• Cancelaciones con menos de 8 días no generan devolución del adelanto.',
                'is_active' => true,
            ],
        );
    }
}
