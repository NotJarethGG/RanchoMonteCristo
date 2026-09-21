<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ranch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'tagline', 'description', 'about',
        'phone', 'whatsapp', 'email',
        'address', 'city', 'province', 'latitude', 'longitude', 'google_maps_url',
        'capacity', 'check_in_time', 'check_out_time',
        'schedule', 'socials', 'event_types', 'areas', 'policies',
        'hero_image_path', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'schedule' => 'array',
            'socials' => 'array',
            'event_types' => 'array',
            'areas' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /** El rancho principal: toda la app trabaja sobre este registro. */
    public static function primary(): self
    {
        return static::query()->orderBy('id')->firstOrFail();
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function galleryImages(): HasMany
    {
        return $this->hasMany(GalleryImage::class);
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function blockedDates(): HasMany
    {
        return $this->hasMany(BlockedDate::class);
    }

    public function pricingRules(): HasMany
    {
        return $this->hasMany(PricingRule::class);
    }
}
