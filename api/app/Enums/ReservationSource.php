<?php

namespace App\Enums;

enum ReservationSource: string
{
    case Web = 'web';
    case Manual = 'manual';
    case Phone = 'phone';
    case Whatsapp = 'whatsapp';

    public function label(): string
    {
        return match ($this) {
            self::Web => 'Sitio web',
            self::Manual => 'Registro manual',
            self::Phone => 'Teléfono',
            self::Whatsapp => 'WhatsApp',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
