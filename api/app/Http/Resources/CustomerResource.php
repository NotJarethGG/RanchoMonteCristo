<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'identification' => $this->identification,
            'notes' => $this->notes,
            'reservations_count' => $this->whenCounted('reservations'),
            'last_reservation_at' => $this->when(
                isset($this->last_reservation_at),
                fn () => $this->last_reservation_at,
            ),
            'reservations' => ReservationResource::collection($this->whenLoaded('reservations')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
