<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Uso: ->middleware('role:admin') o ->middleware('role:admin,staff')
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_if(! $user || ! $user->is_active, 403, 'Tu cuenta está inactiva.');
        abort_if($roles && ! $user->hasRole(...$roles), 403, 'No tenés permisos para esta sección.');

        return $next($request);
    }
}
