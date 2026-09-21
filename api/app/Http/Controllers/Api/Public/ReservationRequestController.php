<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;

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
        $reservation = $this->reservations->request($request->validated());

        return response()->json([
            'message' => 'Recibimos tu solicitud. Te contactamos para confirmar la fecha.',
            'data' => new ReservationResource($reservation->load('customer')),
        ], 201);
    }
}
