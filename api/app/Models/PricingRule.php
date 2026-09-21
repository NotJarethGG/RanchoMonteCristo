<?php

namespace App\Models;

use App\Enums\AmountType;
use App\Enums\PricingRuleType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PricingRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'ranch_id', 'name', 'type', 'amount_type', 'amount',
        'starts_on', 'ends_on', 'weekdays', 'min_guests', 'max_guests',
        'priority', 'is_active', 'description',
    ];

    protected function casts(): array
    {
        return [
            'type' => PricingRuleType::class,
            'amount_type' => AmountType::class,
            'amount' => 'decimal:2',
            'starts_on' => 'date',
            'ends_on' => 'date',
            'weekdays' => 'array',
            'min_guests' => 'integer',
            'max_guests' => 'integer',
            'priority' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function ranch(): BelongsTo
    {
        return $this->belongsTo(Ranch::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('priority')->orderBy('id');
    }
}
