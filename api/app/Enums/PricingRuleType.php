<?php

namespace App\Enums;

enum PricingRuleType: string
{
    case Base = 'base';                 // Precio base del alquiler
    case Weekday = 'weekday';           // Recargo/descuento por día de semana
    case Weekend = 'weekend';           // Fin de semana
    case DateRange = 'date_range';      // Rango específico (fechas especiales)
    case Season = 'season';             // Temporada alta/baja
    case Holiday = 'holiday';           // Feriados
    case PerPerson = 'per_person';      // Cargo por persona

    public function label(): string
    {
        return match ($this) {
            self::Base => 'Precio base',
            self::Weekday => 'Día de semana',
            self::Weekend => 'Fin de semana',
            self::DateRange => 'Rango de fechas',
            self::Season => 'Temporada',
            self::Holiday => 'Feriado',
            self::PerPerson => 'Por persona',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
