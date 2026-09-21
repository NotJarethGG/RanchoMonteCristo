<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/** Solicitud pública de reserva (queda siempre como pendiente). */
class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $minDate = now()->addDays(config('ranch.min_lead_days'))->toDateString();

        return [
            'full_name' => ['required', 'string', 'min:3', 'max:120'],
            'phone' => ['required', 'string', 'min:8', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'event_date' => ['required', 'date', 'after_or_equal:'.$minDate],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'guests' => ['required', 'integer', 'min:1', 'max:1000'],
            'event_type' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'Necesitamos tu nombre completo.',
            'phone.required' => 'Dejanos un teléfono para contactarte.',
            'event_date.after_or_equal' => 'La fecha debe ser al menos con un día de anticipación.',
            'end_time.after' => 'La hora de salida debe ser posterior a la de entrada.',
            'guests.min' => 'Indicá al menos una persona.',
        ];
    }
}
