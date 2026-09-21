<?php

namespace App\Services;

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Models\Customer;
use App\Models\Ranch;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Orquesta la creación y los cambios de estado de una reserva.
 * Mantiene los controladores delgados y la regla de negocio en un solo lugar.
 */
class ReservationService
{
    public function __construct(
        private readonly Ranch $ranch,
        private readonly AvailabilityService $availability,
        private readonly PricingService $pricing,
    ) {
    }

    public static function for(Ranch $ranch): self
    {
        return new self($ranch, AvailabilityService::for($ranch), PricingService::for($ranch));
    }

    /**
     * Crea una solicitud de reserva. Nunca se confirma automáticamente:
     * queda `pending` hasta que el propietario la apruebe.
     *
     * @param  array<string, mixed>  $data
     */
    public function request(array $data, ReservationSource $source = ReservationSource::Web, ?User $actor = null): Reservation
    {
        return DB::transaction(function () use ($data, $source, $actor) {
            if (! $this->availability->isRequestable($data['event_date'])) {
                throw ValidationException::withMessages([
                    'event_date' => 'Esa fecha ya no está disponible. Por favor elegí otra.',
                ]);
            }

            $customer = $this->resolveCustomer($data);
            $quote = $this->pricing->quote($data['event_date'], (int) $data['guests']);

            return Reservation::create([
                'code' => Reservation::generateCode(),
                'ranch_id' => $this->ranch->id,
                'customer_id' => $customer->id,
                'created_by' => $actor?->id,
                'event_date' => $data['event_date'],
                'start_time' => $data['start_time'],
                'end_time' => $data['end_time'],
                'guests' => $data['guests'],
                'event_type' => $data['event_type'] ?? null,
                'notes' => $data['notes'] ?? null,
                'status' => $data['status'] ?? ReservationStatus::Pending->value,
                'source' => $source->value,
                'total_amount' => $data['total_amount'] ?? $quote['total'],
                'deposit_amount' => $data['deposit_amount'] ?? $quote['deposit'],
                'pricing_breakdown' => $quote['lines'],
            ]);
        });
    }

    /** Busca al cliente por teléfono (llave natural) o lo crea. */
    private function resolveCustomer(array $data): Customer
    {
        if (! empty($data['customer_id'])) {
            return Customer::findOrFail($data['customer_id']);
        }

        $phone = Customer::normalizePhone($data['phone']);

        $customer = Customer::firstOrNew(['phone' => $phone]);
        $customer->fill([
            'full_name' => $data['full_name'],
            'email' => $data['email'] ?? $customer->email,
        ])->save();

        return $customer;
    }

    public function confirm(Reservation $reservation): Reservation
    {
        $reservation->update([
            'status' => ReservationStatus::Confirmed,
            'confirmed_at' => now(),
            'cancelled_at' => null,
            'cancellation_reason' => null,
        ]);

        return $reservation->refresh();
    }

    public function cancel(Reservation $reservation, ?string $reason = null): Reservation
    {
        $reservation->update([
            'status' => ReservationStatus::Cancelled,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);

        return $reservation->refresh();
    }

    public function complete(Reservation $reservation): Reservation
    {
        $reservation->update(['status' => ReservationStatus::Completed]);

        return $reservation->refresh();
    }
}
