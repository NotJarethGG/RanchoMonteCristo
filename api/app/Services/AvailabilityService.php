<?php

namespace App\Services;

use App\Enums\ReservationStatus;
use App\Models\Ranch;
use App\Models\Reservation;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Calcula el estado de cada día del calendario público y administrativo.
 *
 * Estados expuestos al frontend:
 *   available | pending | reserved | blocked | past
 */
class AvailabilityService
{
    public function __construct(private readonly Ranch $ranch)
    {
    }

    public static function for(Ranch $ranch): self
    {
        return new self($ranch);
    }

    /**
     * Mapa fecha (Y-m-d) => estado, para el rango indicado.
     *
     * @return Collection<string, array{status: string, reservations: int}>
     */
    public function calendar(string $from, string $to): Collection
    {
        $start = Carbon::parse($from)->startOfDay();
        $end = Carbon::parse($to)->endOfDay();

        $reservations = $this->ranch->reservations()
            ->blocking()
            ->whereBetween('event_date', [$start->toDateString(), $end->toDateString()])
            ->get(['event_date', 'status'])
            ->groupBy(fn (Reservation $r) => $r->event_date->toDateString());

        $blocked = $this->ranch->blockedDates()
            ->overlapping($start->toDateString(), $end->toDateString())
            ->get();

        $today = Carbon::today();

        // Antes de esta fecha no se admiten solicitudes desde el sitio público
        // (el dashboard sí puede registrar reservas para hoy mismo).
        $cutoff = $today->copy()->addDays(config('ranch.min_lead_days'));

        $days = collect();

        for ($day = $start->copy(); $day->lte($end); $day->addDay()) {
            $key = $day->toDateString();
            $dayReservations = $reservations->get($key, collect());

            $status = match (true) {
                $blocked->contains(fn ($b) => $day->betweenIncluded($b->start_date, $b->end_date)) => 'blocked',
                $dayReservations->contains(fn (Reservation $r) => $r->status === ReservationStatus::Confirmed) => 'reserved',
                $dayReservations->isNotEmpty() => 'pending',
                $day->lt($today) => 'past',
                default => 'available',
            };

            $days->put($key, [
                'date' => $key,
                'status' => $status,
                // El sitio público solo deja elegir días con `requestable`;
                // el calendario administrativo ignora este campo.
                'requestable' => $status === 'available' && $day->gte($cutoff),
                'reservations' => $dayReservations->count(),
            ]);
        }

        return $days;
    }

    /** ¿Se puede solicitar esta fecha desde el sitio público? */
    public function isRequestable(string $date, ?int $ignoreReservationId = null): bool
    {
        $day = Carbon::parse($date)->startOfDay();

        if ($day->lt(Carbon::today()->addDays(config('ranch.min_lead_days')))) {
            return false;
        }

        $blocked = $this->ranch->blockedDates()
            ->overlapping($day->toDateString(), $day->toDateString())
            ->exists();

        if ($blocked) {
            return false;
        }

        return ! $this->ranch->reservations()
            ->blocking()
            ->whereDate('event_date', $day->toDateString())
            ->when($ignoreReservationId, fn ($q) => $q->whereKeyNot($ignoreReservationId))
            ->exists();
    }
}
