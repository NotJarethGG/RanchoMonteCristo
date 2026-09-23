<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServiceResource;
use App\Models\Ranch;
use App\Models\Service;
use App\Support\Translations;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    public function index(Ranch $ranch): AnonymousResourceCollection
    {
        return ServiceResource::collection($ranch->services()->ordered()->get());
    }

    public function store(Request $request, Ranch $ranch): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = Str::slug($data['name']);

        $service = $ranch->services()->create($data);

        return response()->json([
            'message' => 'Servicio creado.',
            'data' => new ServiceResource($service),
        ], 201);
    }

    public function update(Request $request, Service $service): JsonResponse
    {
        $data = $this->validated($request);
        $data['slug'] = Str::slug($data['name']);

        $service->update($data);

        return response()->json([
            'message' => 'Servicio actualizado.',
            'data' => new ServiceResource($service),
        ]);
    }

    public function destroy(Service $service): JsonResponse
    {
        $service->delete();

        return response()->json(['message' => 'Servicio eliminado.']);
    }

    /** POST /api/admin/services/reorder — [{id, sort_order}] */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'exists:services,id'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($data['items'] as $item) {
            Service::whereKey($item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Orden actualizado.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:60'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            ...Translations::rules([
                'name' => ['string', 'max:120'],
                'description' => ['string', 'max:1000'],
            ]),
        ]);
    }
}
