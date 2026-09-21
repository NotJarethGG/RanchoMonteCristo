<?php

namespace App\Enums;

enum RoleName: string
{
    case Admin = 'admin';
    case Staff = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrador',
            self::Staff => 'Colaborador',
        };
    }

    /**
     * Habilidades por rol. STAFF gestiona la operación diaria;
     * ADMIN además toca configuración, precios, contenido y usuarios.
     */
    public function permissions(): array
    {
        $operations = [
            'reservations.view', 'reservations.create', 'reservations.update', 'reservations.cancel',
            'customers.view', 'customers.create', 'customers.update',
            'payments.view', 'payments.create',
            'calendar.view', 'calendar.block',
            'dashboard.view',
        ];

        return match ($this) {
            self::Staff => $operations,
            self::Admin => array_merge($operations, [
                'reservations.delete',
                'customers.delete',
                'payments.delete',
                'settings.manage',
                'services.manage',
                'gallery.manage',
                'testimonials.manage',
                'pricing.manage',
                'users.manage',
            ]),
        };
    }
}
