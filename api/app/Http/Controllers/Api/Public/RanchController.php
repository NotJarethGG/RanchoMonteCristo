<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryImageResource;
use App\Http\Resources\RanchResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\TestimonialResource;
use App\Models\Ranch;
use Illuminate\Http\JsonResponse;

class RanchController extends Controller
{
    public function show(Ranch $ranch): RanchResource
    {
        return new RanchResource($ranch);
    }

    /**
     * Payload único para el primer render de la homepage:
     * evita 4 round-trips desde el SPA.
     */
    public function landing(Ranch $ranch): JsonResponse
    {
        $ranch->load([
            'services' => fn ($q) => $q->active()->ordered(),
            'galleryImages' => fn ($q) => $q->active()->ordered(),
            'testimonials' => fn ($q) => $q->published()->ordered(),
        ]);

        return response()->json([
            'data' => [
                'ranch' => new RanchResource($ranch),
                'services' => ServiceResource::collection($ranch->services),
                'gallery' => GalleryImageResource::collection($ranch->galleryImages),
                'testimonials' => TestimonialResource::collection($ranch->testimonials),
            ],
        ]);
    }
}
