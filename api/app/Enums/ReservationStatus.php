<?php

namespace App\Enums;

enum ReservationStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendiente',
            self::Confirmed => 'Confirmada',
            self::Cancelled => 'Cancelada',
            self::Completed => 'Finalizada',
        };
    }

    /** Estados que ocupan la fecha en el calendario. */
    public static function blocking(): array
    {
        return [self::Pending->value, self::Confirmed->value];
    }

    /** Estados que cuentan como ingreso real. */
    public static function billable(): array
    {
        return [self::Confirmed->value, self::Completed->value];
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
