<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    /** GET /api/admin/customers?search= */
    public function index(Request $request): AnonymousResourceCollection
    {
        $customers = Customer::query()
            ->withCount('reservations')
            ->withMax('reservations as last_reservation_at', 'event_date')
            ->search($request->string('search'))
            ->orderByDesc('last_reservation_at')
            ->orderBy('full_name')
            ->paginate(min($request->integer('per_page', 15), 100))
            ->withQueryString();

        return CustomerResource::collection($customers);
    }

    public function show(Customer $customer): CustomerResource
    {
        $customer->loadCount('reservations')
            ->load(['reservations' => fn ($q) => $q->with('payments')->orderByDesc('event_date')]);

        return new CustomerResource($customer);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateCustomer($request);
        $data['phone'] = Customer::normalizePhone($data['phone']);

        $customer = Customer::create($data);

        return response()->json([
            'message' => 'Cliente creado.',
            'data' => new CustomerResource($customer),
        ], 201);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $data = $this->validateCustomer($request, $customer->id);
        $data['phone'] = Customer::normalizePhone($data['phone']);

        $customer->update($data);

        return response()->json([
            'message' => 'Cliente actualizado.',
            'data' => new CustomerResource($customer),
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        abort_if($customer->reservations()->exists(), 422, 'El cliente tiene reservas asociadas.');

        $customer->delete();

        return response()->json(['message' => 'Cliente eliminado.']);
    }

    private function validateCustomer(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'full_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40', 'unique:customers,phone'.($ignoreId ? ",{$ignoreId}" : '')],
            'email' => ['nullable', 'email', 'max:255'],
            'identification' => ['nullable', 'string', 'max:40'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
    }
}
