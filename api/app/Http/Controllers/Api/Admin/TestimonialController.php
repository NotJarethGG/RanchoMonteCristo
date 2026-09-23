<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TestimonialResource;
use App\Models\Ranch;
use App\Models\Testimonial;
use App\Support\Translations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TestimonialController extends Controller
{
    public function index(Ranch $ranch): AnonymousResourceCollection
    {
        return TestimonialResource::collection($ranch->testimonials()->ordered()->get());
    }

    public function store(Request $request, Ranch $ranch): JsonResponse
    {
        $testimonial = $ranch->testimonials()->create($this->validated($request));

        return response()->json([
            'message' => 'Testimonio agregado.',
            'data' => new TestimonialResource($testimonial),
        ], 201);
    }

    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $testimonial->update($this->validated($request));

        return response()->json([
            'message' => 'Testimonio actualizado.',
            'data' => new TestimonialResource($testimonial),
        ]);
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        $testimonial->delete();

        return response()->json(['message' => 'Testimonio eliminado.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'author_name' => ['required', 'string', 'max:120'],
            'event_type' => ['nullable', 'string', 'max:80'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'content' => ['required', 'string', 'max:1000'],
            'avatar_path' => ['nullable', 'string', 'max:500'],
            'event_date' => ['nullable', 'date'],
            'is_published' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            ...Translations::rules([
                'event_type' => ['string', 'max:80'],
                'content' => ['string', 'max:1000'],
            ]),
        ]);
    }
}
