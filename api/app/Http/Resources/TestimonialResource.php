<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'author_name' => $this->author_name,
            'event_type' => $this->event_type,
            'rating' => $this->rating,
            'content' => $this->content,
            'avatar' => $this->avatar_path,
            'event_date' => $this->event_date?->toDateString(),
            'is_published' => $this->is_published,
            'sort_order' => $this->sort_order,
        ];
    }
}
