<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RanchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'about' => $this->about,
            'contact' => [
                'phone' => $this->phone,
                'whatsapp' => $this->whatsapp,
                'email' => $this->email,
            ],
            'location' => [
                'address' => $this->address,
                'city' => $this->city,
                'province' => $this->province,
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
                'google_maps_url' => $this->google_maps_url,
            ],
            'capacity' => $this->capacity,
            'check_in_time' => $this->check_in_time,
            'check_out_time' => $this->check_out_time,
            'schedule' => $this->schedule ?? [],
            'socials' => $this->socials ?? [],
            'event_types' => $this->event_types ?? [],
            'areas' => $this->areas ?? [],
            'policies' => $this->policies,
            'hero_image' => $this->hero_image_path,
            'currency' => config('ranch.currency'),
            'currency_symbol' => config('ranch.currency_symbol'),
        ];
    }
}
