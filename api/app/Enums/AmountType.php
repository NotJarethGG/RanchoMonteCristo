<?php

namespace App\Enums;

enum AmountType: string
{
    case Fixed = 'fixed';            // Monto fijo
    case PerPerson = 'per_person';   // Monto × cantidad de personas
    case Percentage = 'percentage';  // % sobre el subtotal acumulado

    public function label(): string
    {
        return match ($this) {
            self::Fixed => 'Monto fijo',
            self::PerPerson => 'Por persona',
            self::Percentage => 'Porcentaje',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
