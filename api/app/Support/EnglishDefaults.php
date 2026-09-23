<?php

namespace App\Support;

use App\Models\GalleryImage;
use App\Models\PricingRule;
use App\Models\Ranch;
use App\Models\Service;
use App\Models\Testimonial;

/**
 * Traducción al inglés del contenido inicial del rancho.
 *
 * Funciona por coincidencia exacta con el texto en español: si el propietario
 * ya cambió un texto, no se toca, porque la traducción de acá no le
 * correspondería. Tampoco pisa traducciones existentes, así que se puede
 * correr las veces que haga falta. Lo que quede sin traducir se carga desde
 * el panel.
 */
class EnglishDefaults
{
    private const TEXTOS = [
        // Rancho
        'Un rancho entero, solo para tu gente.' => 'A whole ranch, just for your group.',
        'Alquilamos el Rancho Montecristo completo para cumpleaños, bodas, reuniones familiares y paseos. Ese día no hay otros grupos: el lugar es de ustedes.' => 'We rent out all of Rancho Montecristo for birthdays, weddings, family gatherings and day trips. No other groups that day: the place is all yours.',
        'Es una finca privada a la salida de Nicoya, con un rancho techado grande, zonas verdes para que los chiquitos corran y parqueo adentro de la propiedad. Se alquila completo y por el día: llegan en la mañana, lo arreglan a su gusto y lo disfrutan hasta la noche.' => "It's a private property just outside Nicoya, with a large covered pavilion, green areas where the kids can run around and parking inside the property. It's rented whole and by the day: arrive in the morning, set it up your way and enjoy it until evening.",
        "• La fecha se aparta con un adelanto del 50%.\n• El saldo se cancela el día del evento.\n• Se permite música hasta la hora acordada de salida.\n• No se permiten mascotas sin autorización previa.\n• Cancelaciones con menos de 8 días no generan devolución del adelanto." => "• Your date is held with a 50% deposit.\n• The balance is paid on the day of the event.\n• Music is allowed until the agreed departure time.\n• No pets without prior approval.\n• The deposit is not refunded for cancellations made less than 8 days ahead.",
        '1,5 km al oeste de la Escuela Saúl Cárdenas (Plus Code 4GJP+W47)' => '1.5 km west of Escuela Saúl Cárdenas (Plus Code 4GJP+W47)',

        // Horarios
        'Lunes a jueves' => 'Monday to Thursday',
        'Viernes y sábado' => 'Friday and Saturday',
        'Domingo' => 'Sunday',
        '9:00 a.m. – 6:00 p.m.' => '9:00 AM – 6:00 PM',
        '9:00 a.m. – 10:00 p.m.' => '9:00 AM – 10:00 PM',
        '9:00 a.m. – 8:00 p.m.' => '9:00 AM – 8:00 PM',

        // Tipos de evento
        'Cumpleaños' => 'Birthdays',
        'Bodas' => 'Weddings',
        'Aniversarios' => 'Anniversaries',
        'Reuniones familiares' => 'Family gatherings',
        'Eventos de empresa' => 'Company events',
        'Graduaciones' => 'Graduations',
        'Baby shower' => 'Baby showers',
        'Paseos de grupo' => 'Group outings',

        // Áreas
        'Rancho techado principal' => 'Main covered pavilion',
        'Zona de parrillas' => 'Grill area',
        'Cocina equipada' => 'Equipped kitchen',
        'Áreas verdes' => 'Green areas',
        'Parqueo privado' => 'Private parking',

        // Servicios
        'Rancho techado' => 'Covered pavilion',
        'Espacio techado con mesas y sillas para todo el grupo, llueva o truene.' => 'Covered space with tables and chairs for the whole group, rain or shine.',
        'Parrilla' => 'Grill',
        'Zona de parrillas de obra con mesones de preparación y lavado.' => 'Built-in grill area with prep and washing counters.',
        'Cocina con refrigeradora, microondas y espacio para el catering.' => 'Kitchen with a fridge, microwave and room for catering.',
        'Parqueo interno para 30 vehículos dentro de la propiedad.' => 'Parking for 30 vehicles inside the property.',
        'Zonas abiertas para juegos, fotografías y actividades al aire libre.' => 'Open spaces for games, photos and outdoor activities.',
        'Baños y duchas' => 'Restrooms and showers',
        'Servicios sanitarios separados para hombres y mujeres, con duchas.' => "Separate men's and women's restrooms, with showers.",
        'WiFi' => 'Wi-Fi',
        'Internet inalámbrico en el área del rancho principal.' => 'Wireless internet in the main pavilion area.',

        // Galería
        'Cristo de Nicoya iluminado' => 'The Christ of Nicoya, lit up',
        'Vista nocturna desde el rancho' => 'Night view from the ranch',
        'Estatua del Cristo iluminada de noche sobre el cerro' => 'Statue of Christ lit up at night on the hill',
        'Vista del rancho al atardecer' => 'The ranch at sunset',
        'Mesas listas para el evento' => 'Tables set for the event',
        'Camino de entrada' => 'Entrance road',
        'Celebración en el rancho' => 'A celebration at the ranch',
        'Montaña alrededor' => 'The surrounding hills',
        'Cocina y servicio' => 'Kitchen and serving area',

        // Reglas de precio (renglones del cálculo)
        'Alquiler base del día' => 'Base rental for the day',
        'Recargo fin de semana' => 'Weekend surcharge',
        'Cargo por persona adicional' => 'Charge per additional guest',
        'Temporada alta diciembre' => 'December high season',

        // Testimonios
        'Cumpleaños de 15' => 'Quinceañera',
        'Reunión de empresa' => 'Company gathering',
        'Reunión familiar' => 'Family gathering',
        'Boda' => 'Wedding',
        'Todo salió perfecto. El lugar es precioso, muy limpio y el trato fue excelente desde la primera llamada. Nuestros invitados no querían irse.' => "Everything went perfectly. The place is beautiful, very clean, and the service was excellent from the very first call. Our guests didn't want to leave.",
        'Hicimos la actividad anual de la empresa con 80 personas. Amplio, ordenado y con parqueo para todos. Repetimos sin duda.' => "We held our company's annual event with 80 people. Spacious, well organized and with parking for everyone. We'll definitely be back.",
        'Las zonas verdes fueron lo mejor para los chiquitos. Nos dejaron el rancho para nosotros solos todo el día.' => 'The green areas were the best part for the kids. We had the ranch all to ourselves the whole day.',
        'Buscábamos un lugar natural y con vista, y este superó lo que teníamos en mente. Las fotos al atardecer quedaron increíbles.' => 'We were looking for a natural spot with a view, and this one went beyond what we had in mind. The sunset photos came out amazing.',
    ];

    /** Campos de texto de cada modelo que se traducen. */
    private const CAMPOS = [
        Ranch::class => ['tagline', 'description', 'about', 'policies', 'address'],
        Service::class => ['name', 'description'],
        GalleryImage::class => ['title', 'caption', 'alt'],
        PricingRule::class => ['name'],
        Testimonial::class => ['event_type', 'content'],
    ];

    public static function apply(): void
    {
        foreach (self::CAMPOS as $model => $campos) {
            $model::query()->each(function ($registro) use ($campos) {
                $en = $registro->translations['en'] ?? [];

                foreach ($campos as $campo) {
                    if (empty($en[$campo]) && isset(self::TEXTOS[$registro->{$campo} ?? ''])) {
                        $en[$campo] = self::TEXTOS[$registro->{$campo}];
                    }
                }

                if ($registro instanceof Ranch) {
                    $en = self::listas($registro, $en);
                }

                if ($en !== ($registro->translations['en'] ?? [])) {
                    $registro->translations = [...($registro->translations ?? []), 'en' => $en];
                    $registro->saveQuietly();
                }
            });
        }
    }

    /** Horarios, tipos de evento y áreas: solo si se conocen todos los elementos. */
    private static function listas(Ranch $ranch, array $en): array
    {
        $traducir = fn (array $lista) => collect($lista)->every(fn ($texto) => isset(self::TEXTOS[$texto]))
            ? array_map(fn ($texto) => self::TEXTOS[$texto], $lista)
            : null;

        foreach (['event_types', 'areas'] as $campo) {
            if (empty($en[$campo]) && $ranch->{$campo} && ($lista = $traducir($ranch->{$campo}))) {
                $en[$campo] = $lista;
            }
        }

        $horario = $ranch->schedule ?? [];
        if (empty($en['schedule']) && $horario) {
            $dias = $traducir(array_column($horario, 'day'));
            $horas = $traducir(array_column($horario, 'hours'));

            if ($dias && $horas) {
                $en['schedule'] = array_map(
                    fn ($dia, $hora) => ['day' => $dia, 'hours' => $hora],
                    $dias,
                    $horas,
                );
            }
        }

        return $en;
    }
}
