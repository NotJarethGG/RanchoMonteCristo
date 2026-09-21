<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryImageResource;
use App\Http\Resources\ServiceResource;
use App\Http\Resources\TestimonialResource;
use App\Models\Ranch;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CatalogController extends Controller
{
    public function services(Ranch $ranch): AnonymousResourceCollection
    {
        return ServiceResource::collection($ranch->services()->active()->ordered()->get());
    }

    public function gallery(Ranch $ranch): AnonymousResourceCollection
    {
        return GalleryImageResource::collection($ranch->galleryImages()->active()->ordered()->get());
    }

    public function testimonials(Ranch $ranch): AnonymousResourceCollection
    {
        return TestimonialResource::collection($ranch->testimonials()->published()->ordered()->get());
    }
}
