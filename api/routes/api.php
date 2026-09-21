<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\CalendarController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\GalleryController;
use App\Http\Controllers\Api\Admin\PaymentController;
use App\Http\Controllers\Api\Admin\PricingRuleController;
use App\Http\Controllers\Api\Admin\ReservationController as AdminReservationController;
use App\Http\Controllers\Api\Admin\ServiceController;
use App\Http\Controllers\Api\Admin\SettingsController;
use App\Http\Controllers\Api\Admin\TestimonialController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Public\AvailabilityController;
use App\Http\Controllers\Api\Public\CatalogController;
use App\Http\Controllers\Api\Public\RanchController;
use App\Http\Controllers\Api\Public\ReservationRequestController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API pública (sitio web)
|--------------------------------------------------------------------------
*/

Route::middleware('throttle:api')->group(function () {
    Route::get('/ranch', [RanchController::class, 'show']);
    Route::get('/landing', [RanchController::class, 'landing']);
    Route::get('/services', [CatalogController::class, 'services']);
    Route::get('/gallery', [CatalogController::class, 'gallery']);
    Route::get('/testimonials', [CatalogController::class, 'testimonials']);
    Route::get('/availability', [AvailabilityController::class, 'index']);
    Route::get('/availability/quote', [AvailabilityController::class, 'quote']);
});

// El formulario público tiene su propio límite anti-spam.
Route::post('/reservations', [ReservationRequestController::class, 'store'])
    ->middleware('throttle:reservations');

/*
|--------------------------------------------------------------------------
| Autenticación
|--------------------------------------------------------------------------
*/

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
});

/*
|--------------------------------------------------------------------------
| Dashboard administrativo
|--------------------------------------------------------------------------
| auth:sanctum + role:admin,staff protegen toda el área.
| Las rutas de configuración exigen además role:admin.
*/

Route::prefix('admin')
    ->middleware(['auth:sanctum', 'role:admin,staff'])
    ->group(function () {
        Route::get('/dashboard', DashboardController::class);

        // --- Reservas
        Route::get('/reservations', [AdminReservationController::class, 'index']);
        Route::post('/reservations', [AdminReservationController::class, 'store']);
        Route::get('/reservations/{reservation}', [AdminReservationController::class, 'show']);
        Route::put('/reservations/{reservation}', [AdminReservationController::class, 'update']);
        Route::post('/reservations/{reservation}/confirm', [AdminReservationController::class, 'confirm']);
        Route::post('/reservations/{reservation}/cancel', [AdminReservationController::class, 'cancel']);
        Route::post('/reservations/{reservation}/complete', [AdminReservationController::class, 'complete']);

        // --- Calendario
        Route::get('/calendar', [CalendarController::class, 'index']);
        Route::post('/calendar/block', [CalendarController::class, 'block']);
        Route::delete('/calendar/block/{blockedDate}', [CalendarController::class, 'unblock']);

        // --- Clientes
        Route::apiResource('customers', CustomerController::class)->except('destroy');

        // --- Pagos
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::post('/payments', [PaymentController::class, 'store']);

        /*
        | Solo ADMIN: configuración, contenido, precios, usuarios y borrados.
        */
        Route::middleware('role:admin')->group(function () {
            Route::delete('/reservations/{reservation}', [AdminReservationController::class, 'destroy']);
            Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);
            Route::delete('/payments/{payment}', [PaymentController::class, 'destroy']);

            Route::get('/settings', [SettingsController::class, 'show']);
            Route::put('/settings', [SettingsController::class, 'update']);

            Route::apiResource('services', ServiceController::class)->except('show');
            Route::post('/services/reorder', [ServiceController::class, 'reorder']);

            Route::apiResource('gallery', GalleryController::class)->except('show')
                ->parameters(['gallery' => 'galleryImage']);
            Route::post('/gallery/reorder', [GalleryController::class, 'reorder']);

            Route::apiResource('testimonials', TestimonialController::class)->except('show');

            Route::get('/pricing', [PricingRuleController::class, 'index']);
            Route::post('/pricing', [PricingRuleController::class, 'store']);
            Route::put('/pricing/{pricingRule}', [PricingRuleController::class, 'update']);
            Route::delete('/pricing/{pricingRule}', [PricingRuleController::class, 'destroy']);
            Route::post('/pricing/simulate', [PricingRuleController::class, 'simulate']);

            Route::get('/roles', [UserController::class, 'roles']);
            Route::apiResource('users', UserController::class)->except('show');
        });
    });
