<?php

/*
|--------------------------------------------------------------------------
| Configuración de dominio del rancho
|--------------------------------------------------------------------------
| Valores que NO cambian desde el dashboard (reglas de negocio duras).
| Todo lo editable por el propietario vive en la tabla `ranches`.
*/

return [
    // Moneda base del sistema.
    'currency' => env('RANCH_CURRENCY', 'CRC'),
    'currency_symbol' => env('RANCH_CURRENCY_SYMBOL', '₡'),

    // Porcentaje de adelanto sugerido para confirmar una reserva.
    'deposit_percentage' => (float) env('RANCH_DEPOSIT_PERCENTAGE', 50),

    // Días mínimos de anticipación para solicitar una fecha.
    'min_lead_days' => (int) env('RANCH_MIN_LEAD_DAYS', 1),

    // Ventana máxima (meses) que el calendario público muestra hacia adelante.
    'availability_months' => (int) env('RANCH_AVAILABILITY_MONTHS', 12),

    // Una reserva "pendiente" bloquea la fecha por estas horas antes de liberarse.
    'hold_hours' => (int) env('RANCH_HOLD_HOURS', 48),
];
