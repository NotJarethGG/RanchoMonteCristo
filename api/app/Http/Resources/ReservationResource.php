<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $paid = $this->paidAmount();

        return [
            'id' => $this->id,
            'code' => $this->code,
            'event_date' => $this->event_date->toDateString(),
            'start_time' => substr((string) $this->start_time, 0, 5),
            'end_time' => substr((string) $this->end_time, 0, 5),
            'guests' => $this->guests,
            'event_type' => $this->event_type,
            'notes' => $this->notes,
            'internal_notes' => $this->when($request->user() !== null, $this->internal_notes),

            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'source' => $this->source->value,

            'totals' => [
                'total' => (float) $this->total_amount,
                'deposit' => (float) $this->deposit_amount,
                'paid' => round($paid, 2),
                'balance' => $this->balance(),
                'payment_status' => $this->paymentStatus()->value,
                'payment_status_label' => $this->paymentStatus()->label(),
            ],
            'pricing_breakdown' => $this->pricing_breakdown ?? [],

            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'created_by' => $this->whenLoaded('createdBy', fn () => $this->createdBy?->name),

            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'cancellation_reason' => $this->cancellation_reason,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
