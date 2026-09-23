<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class ReservationRequestController extends Controller
{
    public function __construct(private readonly ReservationService $reservations)
    {
    }

    /**
     * POST /api/reservations
     * Crea una SOLICITUD. Nunca confirma automáticamente.
     */
    public function store(StoreReservationRequest $request): JsonResponse
    {
        // Un bot completó el campo señuelo: se le responde como si todo
        // hubiera salido bien, para que no aprenda a esquivarlo, pero no se
        // guarda nada ni se ocupa la fecha.
        if ($request->filled('website')) {
            Log::info('Solicitud de reserva descartada por el señuelo anti-spam', ['ip' => $request->ip()]);

            return response()->json([
                'message' => 'Recibimos tu solicitud. Te contactamos para confirmar la fecha.',
                'data' => null,
            ], 201);
        }

        $reservation = $this->reservations->request($request->safe()->except('website'));

        return response()->json([
            'message' => 'Recibimos tu solicitud. Te contactamos para confirmar la fecha.',
            'data' => new ReservationResource($reservation->load('customer')),
        ], 201);
    }
}
