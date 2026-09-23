<?php

use App\Http\Middleware\EnsureUserHasRole;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // La API es stateless y se consume desde el SPA de React (Vercel).
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        // Render termina TLS en su proxy: sin confiar en él, `isSecure()` es
        // falso, Laravel genera URLs http:// y no se enviaría HSTS.
        $middleware->trustProxies(at: '*');

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // El handler JSON centralizado vive en App\Support\ApiExceptionRenderer.
        \App\Support\ApiExceptionRenderer::register($exceptions);
    })->create();
