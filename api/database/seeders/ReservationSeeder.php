<?php

namespace Database\Seeders;

use App\Enums\PaymentMethod;
use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use App\Models\Customer;
use App\Models\Ranch;
use App\Models\Reservation;
use App\Models\User;
use App\Services\PricingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class ReservationSeeder extends Seeder
{
    /**
     * Genera un escenario realista alrededor de la fecha actual:
     * eventos pasados finalizados, reservas confirmadas próximas,
     * solicitudes pendientes recién llegadas y una cancelación.
     */
    public function run(): void
    {
        $ranch = Ranch::primary();
        $pricing = PricingService::for($ranch);
        $admin = User::where('email', 'admin@ranchomontecristo.com')->first();
        $customers = Customer::all()->keyBy('full_name');

        $blueprint = [
            // [cliente, días respecto a hoy, personas, tipo, estado, % pagado, origen]
            ['María Fernanda Solís', -45, 70, 'Cumpleaños de 15', ReservationStatus::Completed, 1.0, ReservationSource::Web],
            ['Jorge Álvarez Mora', -20, 85, 'Reunión de empresa', ReservationStatus::Completed, 1.0, ReservationSource::Phone],
            ['Cooperativa El Roble', -7, 100, 'Actividad anual', ReservationStatus::Completed, 1.0, ReservationSource::Manual],
            ['Karla Ureña Vargas', 5, 40, 'Reunión familiar', ReservationStatus::Confirmed, 0.5, ReservationSource::Web],
            ['Andrea Campos', 12, 110, 'Boda', ReservationStatus::Confirmed, 0.5, ReservationSource::Whatsapp],
            ['Sebastián Núñez', 21, 30, 'Cumpleaños', ReservationStatus::Confirmed, 0.3, ReservationSource::Web],
            ['María Fernanda Solís', 28, 55, 'Baby shower', ReservationStatus::Pending, 0.0, ReservationSource::Web],
            ['Jorge Álvarez Mora', 34, 60, 'Graduación', ReservationStatus::Pending, 0.0, ReservationSource::Web],
            ['Andrea Campos', 9, 25, 'Paseo de grupo', ReservationStatus::Cancelled, 0.0, ReservationSource::Web],
        ];

        foreach ($blueprint as [$name, $offset, $guests, $type, $status, $paidRatio, $source]) {
            $customer = $customers->get($name);
            if (! $customer) {
                continue;
            }

            $date = Carbon::today()->addDays($offset);
            $quote = $pricing->quote($date, $guests);

            $reservation = Reservation::updateOrCreate(
                ['customer_id' => $customer->id, 'event_date' => $date->toDateString()],
                [
                    'code' => Reservation::generateCode(),
                    'ranch_id' => $ranch->id,
                    'created_by' => $source === ReservationSource::Web ? null : $admin?->id,
                    'start_time' => '09:00',
                    'end_time' => $offset % 2 === 0 ? '18:00' : '20:00',
                    'guests' => $guests,
                    'event_type' => $type,
                    'notes' => 'Consultan si pueden llevar música propia y decoración.',
                    'status' => $status->value,
                    'source' => $source->value,
                    'total_amount' => $quote['total'],
                    'deposit_amount' => $quote['deposit'],
                    'pricing_breakdown' => $quote['lines'],
                    'confirmed_at' => in_array($status, [ReservationStatus::Confirmed, ReservationStatus::Completed], true)
                        ? $date->copy()->subDays(10)
                        : null,
                    'cancelled_at' => $status === ReservationStatus::Cancelled ? now()->subDays(3) : null,
                    'cancellation_reason' => $status === ReservationStatus::Cancelled
                        ? 'El cliente reprogramó para el próximo año.'
                        : null,
                ],
            );

            $this->seedPayments($reservation, $quote['total'], $paidRatio, $admin?->id, $date);
        }
    }

    private function seedPayments(Reservation $reservation, float $total, float $ratio, ?int $userId, Carbon $date): void
    {
        $reservation->payments()->delete();

        if ($ratio <= 0) {
            return;
        }

        // El adelanto siempre entra por SINPE; el saldo en efectivo el día del evento.
        $deposit = round($total * min($ratio, 0.5), 2);

        $reservation->payments()->create([
            'recorded_by' => $userId,
            'amount' => $deposit,
            'method' => PaymentMethod::Sinpe->value,
            'reference' => 'SINPE-'.str_pad((string) random_int(1, 99999), 5, '0', STR_PAD_LEFT),
            'paid_at' => $date->copy()->subDays(12)->max(Carbon::today()->subMonths(3))->toDateString(),
            'notes' => 'Adelanto para apartar la fecha.',
        ]);

        if ($ratio >= 1.0) {
            $reservation->payments()->create([
                'recorded_by' => $userId,
                'amount' => round($total - $deposit, 2),
                'method' => PaymentMethod::Cash->value,
                'paid_at' => $date->toDateString(),
                'notes' => 'Saldo cancelado el día del evento.',
            ]);
        }
    }
}
