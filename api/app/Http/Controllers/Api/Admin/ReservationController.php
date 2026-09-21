<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ReservationSource;
use App\Http\Controllers\Controller;
use App\Http\Requests\AdminReservationRequest;
use App\Http\Resources\ReservationResource;
use App\Models\Ranch;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReservationController extends Controller
{
    public function __construct(private readonly ReservationService $reservations)
    {
    }

    /** GET /api/admin/reservations?status=&from=&to=&search=&per_page= */
    public function index(Request $request, Ranch $ranch): AnonymousResourceCollection
    {
        $reservations = Reservation::query()
            ->where('ranch_id', $ranch->id)
            ->with(['customer', 'payments'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('customer_id'), fn ($q) => $q->where('customer_id', $request->integer('customer_id')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('event_date', '>=', $request->date('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('event_date', '<=', $request->date('to')))
            ->search($request->string('search'))
            ->orderByDesc('event_date')
            ->orderByDesc('id')
            ->paginate(min($request->integer('per_page', 15), 100))
            ->withQueryString();

        return ReservationResource::collection($reservations);
    }

    public function show(Reservation $reservation): ReservationResource
    {
        return new ReservationResource(
            $reservation->load(['customer', 'payments.recordedBy', 'createdBy'])
        );
    }

    /** POST /api/admin/reservations — alta manual */
    public function store(AdminReservationRequest $request): JsonResponse
    {
        $reservation = $this->reservations->request(
            $request->validated(),
            ReservationSource::tryFrom($request->string('source')->toString()) ?? ReservationSource::Manual,
            $request->user(),
        );

        return response()->json([
            'message' => 'Reserva creada.',
            'data' => new ReservationResource($reservation->load('customer')),
        ], 201);
    }

    /** PUT /api/admin/reservations/{reservation} */
    public function update(AdminReservationRequest $request, Reservation $reservation): JsonResponse
    {
        abort_unless($reservation->isEditable(), 422, 'No se puede editar una reserva cancelada.');

        $reservation->fill($request->safe()->only([
            'event_date', 'start_time', 'end_time', 'guests', 'event_type',
            'notes', 'internal_notes', 'total_amount', 'deposit_amount', 'status',
        ]))->save();

        return response()->json([
            'message' => 'Reserva actualizada.',
            'data' => new ReservationResource($reservation->load(['customer', 'payments'])),
        ]);
    }

    /** POST /api/admin/reservations/{reservation}/confirm */
    public function confirm(Reservation $reservation): JsonResponse
    {
        return response()->json([
            'message' => 'Reserva confirmada.',
            'data' => new ReservationResource($this->reservations->confirm($reservation)->load(['customer', 'payments'])),
        ]);
    }

    /** POST /api/admin/reservations/{reservation}/cancel */
    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        $request->validate(['reason' => ['nullable', 'string', 'max:255']]);

        return response()->json([
            'message' => 'Reserva cancelada.',
            'data' => new ReservationResource(
                $this->reservations->cancel($reservation, $request->string('reason')->toString() ?: null)
                    ->load(['customer', 'payments'])
            ),
        ]);
    }

    /** POST /api/admin/reservations/{reservation}/complete */
    public function complete(Reservation $reservation): JsonResponse
    {
        return response()->json([
            'message' => 'Reserva marcada como finalizada.',
            'data' => new ReservationResource($this->reservations->complete($reservation)->load(['customer', 'payments'])),
        ]);
    }

    /** DELETE /api/admin/reservations/{reservation} — solo ADMIN (soft delete) */
    public function destroy(Reservation $reservation): JsonResponse
    {
        $reservation->delete();

        return response()->json(['message' => 'Reserva eliminada.']);
    }
}
