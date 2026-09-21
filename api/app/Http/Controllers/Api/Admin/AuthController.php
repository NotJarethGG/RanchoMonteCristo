<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     * Devuelve un token Bearer de Sanctum. "Recordarme" alarga la expiración.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::with('role')->where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Las credenciales no son correctas.',
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => 'Tu cuenta está desactivada. Contactá al administrador.',
            ]);
        }

        // Se limpian los tokens ya vencidos, pero NO los vigentes: el mismo
        // usuario puede tener sesión abierta en el teléfono y en la laptop.
        $user->tokens()->where('expires_at', '<', now())->delete();

        $expiresAt = $request->boolean('remember') ? now()->addDays(30) : now()->addHours(12);
        $token = $user->createToken('dashboard', $user->role->permissions ?? ['*'], $expiresAt);

        $user->forceFill(['last_login_at' => now()])->save();

        return response()->json([
            'data' => [
                'token' => $token->plainTextToken,
                'expires_at' => $expiresAt->toIso8601String(),
                'user' => new UserResource($user),
            ],
        ]);
    }

    /** POST /api/auth/logout */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada.']);
    }

    /** GET /api/auth/me */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('role'));
    }
}
