<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RanchSettingsRequest;
use App\Http\Resources\RanchResource;
use App\Models\Ranch;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /** GET /api/admin/settings */
    public function show(Ranch $ranch): RanchResource
    {
        return new RanchResource($ranch);
    }

    /** PUT /api/admin/settings */
    public function update(RanchSettingsRequest $request, Ranch $ranch): JsonResponse
    {
        $ranch->update($request->validated());

        return response()->json([
            'message' => 'Configuración guardada.',
            'data' => new RanchResource($ranch->refresh()),
        ]);
    }
}
