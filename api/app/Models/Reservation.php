<?php

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'ranch_id', 'customer_id', 'created_by',
        'event_date', 'start_time', 'end_time', 'guests', 'event_type',
        'notes', 'internal_notes', 'status', 'source',
        'confirmed_at', 'cancelled_at', 'cancellation_reason',
        'total_amount', 'deposit_amount', 'pricing_breakdown',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date',
            'status' => ReservationStatus::class,
            'source' => ReservationSource::class,
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'guests' => 'integer',
            'total_amount' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'pricing_breakdown' => 'array',
        ];
    }

    // ---------------------------------------------------------------- Relaciones

    public function ranch(): BelongsTo
    {
        return $this->belongsTo(Ranch::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // ---------------------------------------------------------------- Dinero

    public function paidAmount(): float
    {
        return (float) ($this->relationLoaded('payments')
            ? $this->payments->sum('amount')
            : $this->payments()->sum('amount'));
    }

    public function balance(): float
    {
        return round((float) $this->total_amount - $this->paidAmount(), 2);
    }

    public function paymentStatus(): PaymentStatus
    {
        $paid = $this->paidAmount();

        return match (true) {
            $paid <= 0 => PaymentStatus::Pending,
            $paid + 0.01 >= (float) $this->total_amount => PaymentStatus::Paid,
            default => PaymentStatus::Partial,
        };
    }

    // ---------------------------------------------------------------- Scopes

    public function scopeBlocking(Builder $query): Builder
    {
        return $query->whereIn('status', ReservationStatus::blocking());
    }

    public function scopeBillable(Builder $query): Builder
    {
        return $query->whereIn('status', ReservationStatus::billable());
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->whereDate('event_date', '>=', now()->toDateString())
            ->orderBy('event_date')
            ->orderBy('start_time');
    }

    public function scopeForMonth(Builder $query, int $year, int $month): Builder
    {
        return $query->whereYear('event_date', $year)->whereMonth('event_date', $month);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('code', 'like', "%{$term}%")
                ->orWhere('event_type', 'like', "%{$term}%")
                ->orWhereHas('customer', fn (Builder $c) => $c->search($term));
        });
    }

    // ---------------------------------------------------------------- Helpers

    /** Genera el consecutivo legible: RMC-2025-0007 */
    public static function generateCode(): string
    {
        $year = now()->year;
        $count = static::withTrashed()->whereYear('created_at', $year)->count() + 1;

        return sprintf('RMC-%d-%04d', $year, $count);
    }

    public function isEditable(): bool
    {
        return $this->status !== ReservationStatus::Cancelled;
    }
}
