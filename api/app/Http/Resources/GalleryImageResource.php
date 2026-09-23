<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GalleryImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'caption' => $this->caption,
            'alt' => $this->alt ?? $this->title,
            'url' => $this->url,
            'category' => $this->category,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            // Textos en inglés que cargó el propietario. Los que faltan se
            // muestran en español.
            'translations' => (object) ($this->translations ?? []),
        ];
    }
}
