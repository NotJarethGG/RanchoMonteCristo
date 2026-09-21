<?php

namespace App\Services;

use App\Enums\AmountType;
use App\Enums\PricingRuleType;
use App\Models\PricingRule;
use App\Models\Ranch;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Motor de precios por reglas.
 *
 * Se resuelve en un solo paso ordenado por `priority`: la regla `base`
 * establece el subtotal y el resto lo modifica. Cada regla aplicada queda
 * registrada en el desglose para poder mostrarla en el dashboard y
 * congelarla dentro de la reserva.
 */
class PricingService
{
    public function __construct(private readonly Ranch $ranch)
    {
    }

    public static function for(Ranch $ranch): self
    {
        return new self($ranch);
    }

    /**
     * @return array{total: float, deposit: float, currency: string, lines: array<int, array<string, mixed>>}
     */
    public function quote(CarbonInterface|string $date, int $guests): array
    {
        $date = $date instanceof CarbonInterface ? $date : Carbon::parse($date);

        $rules = $this->ranch->pricingRules()->active()->ordered()->get()
            ->filter(fn (PricingRule $rule) => $this->applies($rule, $date, $guests));

        $subtotal = 0.0;
        $lines = [];

        foreach ($rules as $rule) {
            $value = $this->valueFor($rule, $subtotal, $guests);

            if ($rule->type === PricingRuleType::Base) {
                $subtotal = $value;
            } else {
                $subtotal += $value;
            }

            $lines[] = [
                'rule_id' => $rule->id,
                'name' => $rule->name,
                'type' => $rule->type->value,
                'amount_type' => $rule->amount_type->value,
                'amount' => (float) $rule->amount,
                'computed' => round($value, 2),
            ];
        }

        $total = round(max($subtotal, 0), 2);
        $deposit = round($total * (config('ranch.deposit_percentage') / 100), 2);

        return [
            'total' => $total,
            'deposit' => $deposit,
            'currency' => config('ranch.currency'),
            'lines' => $lines,
        ];
    }

    private function applies(PricingRule $rule, CarbonInterface $date, int $guests): bool
    {
        if ($rule->starts_on && $date->lt($rule->starts_on)) {
            return false;
        }

        if ($rule->ends_on && $date->gt($rule->ends_on)) {
            return false;
        }

        if (filled($rule->weekdays) && ! in_array($date->dayOfWeek, $rule->weekdays, true)) {
            return false;
        }

        if ($rule->min_guests !== null && $guests < $rule->min_guests) {
            return false;
        }

        if ($rule->max_guests !== null && $guests > $rule->max_guests) {
            return false;
        }

        return true;
    }

    private function valueFor(PricingRule $rule, float $subtotal, int $guests): float
    {
        return match ($rule->amount_type) {
            AmountType::Fixed => (float) $rule->amount,
            AmountType::PerPerson => (float) $rule->amount * $guests,
            AmountType::Percentage => $subtotal * ((float) $rule->amount / 100),
        };
    }
}
