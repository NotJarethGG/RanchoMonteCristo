<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;
use App\Models\Ranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    public function index(Ranch $ranch): AnonymousResourceCollection
    {
        return GalleryImageResource::collection($ranch->galleryImages()->ordered()->get());
    }

    /**
     * POST /api/admin/gallery (multipart)
     * Acepta un archivo `image` o una `path`/URL externa.
     */
    public function store(Request $request, Ranch $ranch): JsonResponse
    {
        $data = $request->validate([
            'image' => ['required_without:path', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'path' => ['required_without:image', 'string', 'max:500'],
            'title' => ['nullable', 'string', 'max:150'],
            'caption' => ['nullable', 'string', 'max:255'],
            'alt' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:60'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $path = $request->hasFile('image')
            ? $request->file('image')->store('gallery', 'public')
            : $data['path'];

        $image = $ranch->galleryImages()->create([
            ...collect($data)->except(['image', 'path'])->all(),
            'path' => $path,
            'sort_order' => (int) $ranch->galleryImages()->max('sort_order') + 1,
        ]);

        if ($image->is_featured) {
            $this->unsetOtherFeatured($ranch, $image);
        }

        return response()->json([
            'message' => 'Imagen agregada.',
            'data' => new GalleryImageResource($image),
        ], 201);
    }

    public function update(Request $request, GalleryImage $galleryImage): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:150'],
            'caption' => ['nullable', 'string', 'max:255'],
            'alt' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:60'],
            'is_featured' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $galleryImage->update($data);

        if ($galleryImage->is_featured) {
            $this->unsetOtherFeatured($galleryImage->ranch, $galleryImage);
        }

        return response()->json([
            'message' => 'Imagen actualizada.',
            'data' => new GalleryImageResource($galleryImage),
        ]);
    }

    public function destroy(GalleryImage $galleryImage): JsonResponse
    {
        if (! Str::startsWith($galleryImage->path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($galleryImage->path);
        }

        $galleryImage->delete();

        return response()->json(['message' => 'Imagen eliminada.']);
    }

    /** POST /api/admin/gallery/reorder */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:gallery_images,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['items'] as $item) {
            GalleryImage::whereKey($item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Orden actualizado.']);
    }

    private function unsetOtherFeatured(Ranch $ranch, GalleryImage $current): void
    {
        $ranch->galleryImages()->whereKeyNot($current->id)->update(['is_featured' => false]);
    }
}
