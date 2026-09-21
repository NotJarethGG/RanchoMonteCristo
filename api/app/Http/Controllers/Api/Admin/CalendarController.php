<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlockedDateResource;
use App\Http\Resources\ReservationResource;
use App\Models\BlockedDate;
use App\Models\Ranch;
use App\Models\Reservation;
use App\Services\AvailabilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CalendarController extends Controller
{
    public function __construct(private readonly AvailabilityService $availability)
    {
    }

    /** GET /api/admin/calendar?month=2025-10 */
    public function index(Request $request, Ranch $ranch): JsonResponse
    {
        $month = Carbon::parse($request->string('month')->toString() ?: now()->format('Y-m').'-01');
        $from = $month->copy()->startOfMonth();
        $to = $month->copy()->endOfMonth();

        $reservations = Reservation::query()
            ->where('ranch_id', $ranch->id)
            ->whereBetween('event_date', [$from->toDateString(), $to->toDateString()])
            ->with(['customer', 'payments'])
            ->orderBy('event_date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'data' => [
                'month' => $from->format('Y-m'),
                'days' => $this->availability->calendar($from->toDateString(), $to->toDateString())->values(),
                'reservations' => ReservationResource::collection($reservations),
                'blocked_dates' => BlockedDateResource::collection(
                    $ranch->blockedDates()->overlapping($from->toDateString(), $to->toDateString())->get()
                ),
            ],
        ]);
    }

    /** POST /api/admin/calendar/block */
    public function block(Request $request, Ranch $ranch): JsonResponse
    {
        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $blocked = $ranch->blockedDates()->create([
            ...$data,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Fecha bloqueada.',
            'data' => new BlockedDateResource($blocked),
        ], 201);
    }

    /** DELETE /api/admin/calendar/block/{blockedDate} */
    public function unblock(BlockedDate $blockedDate): JsonResponse
    {
        $blockedDate->delete();

        return response()->json(['message' => 'Bloqueo eliminado.']);
    }
}
