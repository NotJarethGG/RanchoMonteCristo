<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ReservationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReservationResource;
use App\Models\Payment;
use App\Models\Ranch;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /** GET /api/admin/dashboard */
    public function __invoke(Ranch $ranch): JsonResponse
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $monthReservations = Reservation::query()
            ->where('ranch_id', $ranch->id)
            ->whereBetween('event_date', [$startOfMonth->toDateString(), $endOfMonth->toDateString()]);

        $incomeThisMonth = Payment::query()
            ->whereBetween('paid_at', [$startOfMonth->toDateString(), $endOfMonth->toDateString()])
            ->sum('amount');

        // Saldo pendiente = total facturable - pagos recibidos (reservas vigentes).
        $billable = Reservation::query()
            ->where('ranch_id', $ranch->id)
            ->billable()
            ->withSum('payments as paid_sum', 'amount')
            ->get(['id', 'total_amount']);

        $pendingBalance = $billable->sum(fn ($r) => max((float) $r->total_amount - (float) ($r->paid_sum ?? 0), 0));

        $upcoming = Reservation::query()
            ->where('ranch_id', $ranch->id)
            ->whereNot('status', ReservationStatus::Cancelled)
            ->upcoming()
            ->with(['customer', 'payments'])
            ->limit(8)
            ->get();

        return response()->json([
            'data' => [
                'stats' => [
                    'reservations_this_month' => (clone $monthReservations)->count(),
                    'pending' => Reservation::where('ranch_id', $ranch->id)->where('status', ReservationStatus::Pending)->count(),
                    'confirmed' => Reservation::where('ranch_id', $ranch->id)->where('status', ReservationStatus::Confirmed)->count(),
                    'income_this_month' => round((float) $incomeThisMonth, 2),
                    'pending_balance' => round($pendingBalance, 2),
                    'occupancy_rate' => $this->occupancyRate($ranch, $startOfMonth, $endOfMonth),
                ],
                'next_reservation' => $upcoming->first()
                    ? new ReservationResource($upcoming->first())
                    : null,
                'upcoming' => ReservationResource::collection($upcoming),
                'monthly_series' => $this->monthlySeries($ranch),
                'currency' => config('ranch.currency_symbol'),
            ],
        ]);
    }

    /** % de días del mes con al menos una reserva vigente. */
    private function occupancyRate(Ranch $ranch, Carbon $from, Carbon $to): float
    {
        $days = Reservation::query()
            ->where('ranch_id', $ranch->id)
            ->blocking()
            ->whereBetween('event_date', [$from->toDateString(), $to->toDateString()])
            ->distinct()
            ->count('event_date');

        return round(($days / $from->daysInMonth) * 100, 1);
    }

    /** Serie de los últimos 6 meses: reservas e ingresos. */
    private function monthlySeries(Ranch $ranch): array
    {
        return collect(range(5, 0))
            ->map(function (int $back) use ($ranch) {
                $month = Carbon::now()->subMonths($back);
                $from = $month->copy()->startOfMonth()->toDateString();
                $to = $month->copy()->endOfMonth()->toDateString();

                return [
                    'month' => $month->translatedFormat('M'),
                    'key' => $month->format('Y-m'),
                    'reservations' => Reservation::where('ranch_id', $ranch->id)
                        ->whereBetween('event_date', [$from, $to])
                        ->billable()
                        ->count(),
                    'income' => round((float) Payment::whereBetween('paid_at', [$from, $to])->sum('amount'), 2),
                ];
            })
            ->values()
            ->all();
    }
}
