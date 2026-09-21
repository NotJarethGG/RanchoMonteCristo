<?php

namespace App\Support;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Manejo centralizado de errores: toda la API responde con la misma forma
 * ({ message, errors? }) para que el cliente tenga un solo camino de error.
 */
class ApiExceptionRenderer
{
    public static function register(Exceptions $exceptions): void
    {
        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $request->is('api/*') || $request->expectsJson());

        $exceptions->render(function (Throwable $e, Request $request) {
            if (! ($request->is('api/*') || $request->expectsJson())) {
                return null;
            }

            [$status, $message] = self::resolve($e);

            $payload = ['message' => $message];

            if ($e instanceof ValidationException) {
                $payload['errors'] = $e->errors();
            }

            if (config('app.debug') && $status === 500) {
                $payload['exception'] = $e::class;
                $payload['file'] = $e->getFile().':'.$e->getLine();
            }

            return response()->json($payload, $status);
        });
    }

    /** @return array{0: int, 1: string} */
    private static function resolve(Throwable $e): array
    {
        return match (true) {
            $e instanceof ValidationException => [422, 'Revisá los datos del formulario.'],
            $e instanceof AuthenticationException => [401, 'Necesitás iniciar sesión.'],
            $e instanceof AuthorizationException => [403, 'No tenés permisos para esta acción.'],
            $e instanceof ModelNotFoundException,
            $e instanceof NotFoundHttpException => [404, 'No encontramos lo que buscabas.'],
            $e instanceof HttpExceptionInterface => [$e->getStatusCode(), $e->getMessage() ?: 'Error en la solicitud.'],
            default => [500, config('app.debug') ? $e->getMessage() : 'Ocurrió un error inesperado.'],
        };
    }
}
