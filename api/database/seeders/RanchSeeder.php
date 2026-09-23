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
                'name' => 'Rancho Montecristo',
                'tagline' => 'Un rancho entero, solo para tu gente.',
                'description' => 'Alquilamos el Rancho Montecristo completo para cumpleaños, bodas, reuniones familiares y paseos. Ese día no hay otros grupos: el lugar es de ustedes.',
                'about' => 'Es una finca privada a la salida de Nicoya, con un rancho techado grande, zonas verdes '
                    .'para que los chiquitos corran y parqueo adentro de la propiedad. Se alquila completo y por '
                    .'el día: llegan en la mañana, lo arreglan a su gusto y lo disfrutan hasta la noche.',

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
