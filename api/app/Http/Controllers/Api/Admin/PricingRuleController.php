<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\AmountType;
use App\Enums\PricingRuleType;
use App\Http\Controllers\Controller;
use App\Http\Resources\PricingRuleResource;
use App\Models\PricingRule;
use App\Models\Ranch;
use App\Services\PricingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PricingRuleController extends Controller
{
    public function index(Ranch $ranch): JsonResponse
    {
        return response()->json([
            'data' => PricingRuleResource::collection($ranch->pricingRules()->ordered()->get()),
            'meta' => [
                'types' => collect(PricingRuleType::cases())
                    ->map(fn ($t) => ['value' => $t->value, 'label' => $t->label()])->all(),
                'amount_types' => collect(AmountType::cases())
                    ->map(fn ($t) => ['value' => $t->value, 'label' => $t->label()])->all(),
                'deposit_percentage' => config('ranch.deposit_percentage'),
                'currency' => config('ranch.currency_symbol'),
            ],
        ]);
    }

    public function store(Request $request, Ranch $ranch): JsonResponse
    {
        $rule = $ranch->pricingRules()->create($this->validated($request));

        return response()->json([
            'message' => 'Regla de precio creada.',
            'data' => new PricingRuleResource($rule),
        ], 201);
    }

    public function update(Request $request, PricingRule $pricingRule): JsonResponse
    {
        $pricingRule->update($this->validated($request));

        return response()->json([
            'message' => 'Regla actualizada.',
            'data' => new PricingRuleResource($pricingRule),
        ]);
    }

    public function destroy(PricingRule $pricingRule): JsonResponse
    {
        $pricingRule->delete();

        return response()->json(['message' => 'Regla eliminada.']);
    }

    /** POST /api/admin/pricing/simulate — prueba una cotización sin crear nada. */
    public function simulate(Request $request, PricingService $pricing): JsonResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'guests' => ['required', 'integer', 'min:1', 'max:1000'],
        ]);

        return response()->json(['data' => $pricing->quote($data['date'], (int) $data['guests'])]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', Rule::in(PricingRuleType::values())],
            'amount_type' => ['required', Rule::in(AmountType::values())],
            'amount' => ['required', 'numeric', 'min:0'],
            'starts_on' => ['nullable', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
            'weekdays' => ['nullable', 'array'],
            'weekdays.*' => ['integer', 'between:0,6'],
            'min_guests' => ['nullable', 'integer', 'min:1'],
            'max_guests' => ['nullable', 'integer', 'gte:min_guests'],
            'priority' => ['sometimes', 'integer', 'min:0', 'max:999'],
            'is_active' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string', 'max:500'],
        ]);
    }
}
