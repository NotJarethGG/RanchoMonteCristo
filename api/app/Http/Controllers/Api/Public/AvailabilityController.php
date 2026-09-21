<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Services\AvailabilityService;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AvailabilityController extends Controller
{
    public function __construct(
        private readonly AvailabilityService $availability,
        private readonly PricingService $pricing,
    ) {
    }

    /** GET /api/availability?from=2025-10-01&to=2025-12-31 */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        $from = Carbon::parse($validated['from'] ?? now()->startOfMonth());
        $to = Carbon::parse($validated['to'] ?? $from->copy()->addMonths(2)->endOfMonth());

        // Techo de seguridad para no generar rangos enormes.
        $maxTo = $from->copy()->addMonths(config('ranch.availability_months'));
        if ($to->gt($maxTo)) {
            $to = $maxTo;
        }

        return response()->json([
            'data' => $this->availability->calendar($from->toDateString(), $to->toDateString())->values(),
            'meta' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
        ]);
    }

    /** GET /api/availability/quote?date=2025-12-24&guests=60 */
    public function quote(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date'],
            'guests' => ['required', 'integer', 'min:1', 'max:1000'],
        ]);

        return response()->json([
            'data' => [
                'available' => $this->availability->isRequestable($validated['date']),
                'quote' => $this->pricing->quote($validated['date'], (int) $validated['guests']),
            ],
        ]);
    }
}
