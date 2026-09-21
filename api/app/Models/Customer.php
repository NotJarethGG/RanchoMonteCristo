<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['full_name', 'phone', 'email', 'identification', 'notes'];

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (blank($term)) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->whereLike('full_name', $term)
                ->orWhereLike('phone', $term)
                ->orWhereLike('email', $term);
        });
    }

    /** Normaliza el teléfono para evitar duplicar clientes. */
    public static function normalizePhone(string $phone): string
    {
        return preg_replace('/[^0-9+]/', '', $phone) ?: $phone;
    }
}
