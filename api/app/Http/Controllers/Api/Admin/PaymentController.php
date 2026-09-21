<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Http\Resources\ReservationResource;
use App\Models\Payment;
use App\Models\Ranch;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * GET /api/admin/payments
     * Vista de control: una fila por reserva con su estado de pago.
     *
     * El estado de pago es derivado (suma de pagos vs. total), así que el
     * filtro se resuelve con un HAVING sobre la suma, no con una columna.
     */
    public function index(Request $request, Ranch $ranch): JsonResponse
    {
        $status = $request->string('status')->toString();

        // Subconsulta correlacionada con lo pagado: se puede usar en WHERE
        // (un HAVING sin GROUP BY colapsaría todo el resultado en una fila).
        $paid = '(SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.reservation_id = reservations.id)';

        $reservations = Reservation::query()
            ->where('ranch_id', $ranch->id)
            ->billable()
            ->with(['customer', 'payments'])
            ->search($request->string('search'))
            ->when($status, fn ($q) => match ($status) {
                'pending' => $q->whereRaw("{$paid} <= 0"),
                'partial' => $q->whereRaw("{$paid} > 0 AND {$paid} < reservations.total_amount"),
                'paid' => $q->whereRaw("{$paid} >= reservations.total_amount"),
                default => $q,
            })
            ->orderByDesc('event_date')
            ->paginate(min($request->integer('per_page', 20), 100))
            ->withQueryString();

        return response()->json([
            ...ReservationResource::collection($reservations)->response()->getData(true),
            'summary' => [
                'total' => round((float) $reservations->sum('total_amount'), 2),
                'paid' => round($reservations->sum(fn ($r) => $r->paidAmount()), 2),
                'balance' => round($reservations->sum(fn ($r) => $r->balance()), 2),
                'filtered_by_status' => $status ?: null,
            ],
        ]);
    }

    /** POST /api/admin/payments */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $reservation = Reservation::findOrFail($request->integer('reservation_id'));

        $payment = $reservation->payments()->create([
            ...$request->safe()->except('reservation_id'),
            'recorded_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Pago registrado.',
            'data' => new PaymentResource($payment->load('recordedBy')),
            'reservation' => new ReservationResource($reservation->load(['customer', 'payments'])),
        ], 201);
    }

    /** DELETE /api/admin/payments/{payment} — solo ADMIN */
    public function destroy(Payment $payment): JsonResponse
    {
        $payment->delete();

        return response()->json(['message' => 'Pago eliminado.']);
    }
}
