<?php

namespace Database\Seeders;

use App\Enums\AmountType;
use App\Enums\PricingRuleType;
use App\Models\Ranch;
use Illuminate\Database\Seeder;

class PricingRuleSeeder extends Seeder
{
    /**
     * Esquema de ejemplo en colones:
     *   base ₡150.000 → +₡60.000 fin de semana → +₡1.500 por persona sobre 50
     *   → +20% en temporada alta de diciembre.
     */
    public function run(): void
    {
        $ranch = Ranch::primary();

        $rules = [
            [
                'name' => 'Alquiler base del día',
                'type' => PricingRuleType::Base->value,
                'amount_type' => AmountType::Fixed->value,
                'amount' => 150000,
                'priority' => 10,
                'description' => 'Precio del alquiler del rancho completo por un día.',
            ],
            [
                'name' => 'Recargo fin de semana',
                'type' => PricingRuleType::Weekend->value,
                'amount_type' => AmountType::Fixed->value,
                'amount' => 60000,
                'weekdays' => [5, 6, 0],   // viernes, sábado y domingo
                'priority' => 20,
                'description' => 'Aplica viernes, sábado y domingo.',
            ],
            [
                'name' => 'Cargo por persona adicional',
                'type' => PricingRuleType::PerPerson->value,
                'amount_type' => AmountType::PerPerson->value,
                'amount' => 1500,
                'min_guests' => 51,
                'priority' => 30,
                'description' => 'Se cobra por persona cuando el grupo supera las 50.',
            ],
            [
                'name' => 'Temporada alta diciembre',
                'type' => PricingRuleType::Season->value,
                'amount_type' => AmountType::Percentage->value,
                'amount' => 20,
                'starts_on' => now()->month(12)->day(15)->toDateString(),
                'ends_on' => now()->addYear()->month(1)->day(6)->toDateString(),
                'priority' => 40,
                'description' => 'Recargo del 20% entre el 15 de diciembre y el 6 de enero.',
            ],
        ];

        foreach ($rules as $rule) {
            $ranch->pricingRules()->updateOrCreate(
                ['name' => $rule['name']],
                [...$rule, 'is_active' => true],
            );
        }
    }
}
