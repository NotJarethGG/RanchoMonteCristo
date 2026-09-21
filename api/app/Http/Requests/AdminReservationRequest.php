<?php

namespace App\Http\Requests;

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Alta/edición manual desde el dashboard: más permisiva que la pública. */
class AdminReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('reservations.create') ?? false;
    }

    public function rules(): array
    {
        $creating = $this->isMethod('POST');

        return [
            'customer_id' => ['nullable', 'exists:customers,id'],
            'full_name' => [Rule::requiredIf($creating && ! $this->filled('customer_id')), 'string', 'max:120'],
            'phone' => [Rule::requiredIf($creating && ! $this->filled('customer_id')), 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],

            'event_date' => [$creating ? 'required' : 'sometimes', 'date'],
            'start_time' => [$creating ? 'required' : 'sometimes', 'date_format:H:i'],
            'end_time' => [$creating ? 'required' : 'sometimes', 'date_format:H:i', 'after:start_time'],
            'guests' => [$creating ? 'required' : 'sometimes', 'integer', 'min:1', 'max:1000'],
            'event_type' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'internal_notes' => ['nullable', 'string', 'max:2000'],

            'status' => ['sometimes', Rule::in(ReservationStatus::values())],
            'source' => ['sometimes', Rule::in(ReservationSource::values())],
            'total_amount' => ['sometimes', 'numeric', 'min:0'],
            'deposit_amount' => ['sometimes', 'numeric', 'min:0'],
        ];
    }
}
