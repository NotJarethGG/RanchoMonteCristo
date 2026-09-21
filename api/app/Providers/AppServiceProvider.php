<?php

namespace App\Providers;

use App\Models\Ranch;
use App\Services\AvailabilityService;
use App\Services\PricingService;
use App\Services\ReservationService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // El rancho principal se resuelve una sola vez por request.
        $this->app->scoped(Ranch::class, fn () => Ranch::primary());

        $this->app->scoped(AvailabilityService::class, fn ($app) => AvailabilityService::for($app->make(Ranch::class)));
        $this->app->scoped(PricingService::class, fn ($app) => PricingService::for($app->make(Ranch::class)));
        $this->app->scoped(ReservationService::class, fn ($app) => ReservationService::for($app->make(Ranch::class)));
    }

    public function boot(): void
    {
        $this->registerSearchMacros();

        Model::preventLazyLoading($this->app->isLocal());
        Model::unguard(false);

        // Protege el formulario público y el login contra abuso.
        RateLimiter::for('reservations', fn (Request $request) => Limit::perHour(10)->by($request->ip()));
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by($request->user()?->id ?: $request->ip()));
    }

    /**
     * Búsquedas insensibles a mayúsculas en cualquier motor.
     *
     * MySQL las hace así por su colación (utf8mb4_unicode_ci), pero en
     * PostgreSQL `LIKE` distingue mayúsculas: sin esto, buscar "jorge"
     * no encontraría a "Jorge". `ILIKE` resuelve el caso en Postgres.
     */
    private function registerSearchMacros(): void
    {
        $operator = fn (Builder $query) => $query->getConnection()->getDriverName() === 'pgsql'
            ? 'ilike'
            : 'like';

        Builder::macro('whereLike', function (string $column, string $term) use ($operator) {
            /** @var Builder $this */
            return $this->where($column, $operator($this), "%{$term}%");
        });

        Builder::macro('orWhereLike', function (string $column, string $term) use ($operator) {
            /** @var Builder $this */
            return $this->orWhere($column, $operator($this), "%{$term}%");
        });
    }
}
