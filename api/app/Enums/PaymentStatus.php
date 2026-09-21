<?php

namespace App\Enums;

/**
 * Estado de pago DERIVADO de la suma de pagos contra el total de la reserva.
 * No se persiste: se calcula en App\Models\Reservation::paymentStatus().
 */
enum PaymentStatus: string
{
    case Pending = 'pending';
    case Partial = 'partial';
    case Paid = 'paid';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendiente',
            self::Partial => 'Parcial',
            self::Paid => 'Pagado',
        };
    }
}
