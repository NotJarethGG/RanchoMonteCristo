<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PricingRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'amount_type' => $this->amount_type->value,
            'amount_type_label' => $this->amount_type->label(),
            'amount' => (float) $this->amount,
            'starts_on' => $this->starts_on?->toDateString(),
            'ends_on' => $this->ends_on?->toDateString(),
            'weekdays' => $this->weekdays,
            'min_guests' => $this->min_guests,
            'max_guests' => $this->max_guests,
            'priority' => $this->priority,
            'is_active' => $this->is_active,
            'description' => $this->description,
            // Textos en inglés que cargó el propietario. Los que faltan se
            // muestran en español.
            'translations' => (object) ($this->translations ?? []),
        ];
    }
}
