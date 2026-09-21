<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RanchSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('settings.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:200'],
            'description' => ['nullable', 'string', 'max:5000'],
            'about' => ['nullable', 'string', 'max:5000'],

            'phone' => ['nullable', 'string', 'max:40'],
            'whatsapp' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],

            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'province' => ['nullable', 'string', 'max:120'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'google_maps_url' => ['nullable', 'url', 'max:500'],

            'capacity' => ['nullable', 'integer', 'min:0', 'max:5000'],
            'check_in_time' => ['nullable', 'date_format:H:i'],
            'check_out_time' => ['nullable', 'date_format:H:i'],
            'schedule' => ['nullable', 'array'],
            'socials' => ['nullable', 'array'],
            'socials.*' => ['nullable', 'string', 'max:255'],
            'event_types' => ['nullable', 'array'],
            'event_types.*' => ['string', 'max:80'],
            'areas' => ['nullable', 'array'],
            'areas.*' => ['string', 'max:120'],
            'policies' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
