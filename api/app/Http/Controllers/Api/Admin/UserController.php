<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(User::with('role')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', Password::min(8)->letters()->numbers()],
            'role_id' => ['required', 'exists:roles,id'],
            'phone' => ['nullable', 'string', 'max:40'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user = User::create($data);

        return response()->json([
            'message' => 'Usuario creado.',
            'data' => new UserResource($user->load('role')),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'password' => ['nullable', Password::min(8)->letters()->numbers()],
            'role_id' => ['sometimes', 'exists:roles,id'],
            'phone' => ['nullable', 'string', 'max:40'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user->update(array_filter($data, fn ($v, $k) => $k !== 'password' || filled($v), ARRAY_FILTER_USE_BOTH));

        return response()->json([
            'message' => 'Usuario actualizado.',
            'data' => new UserResource($user->load('role')),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'No podés eliminar tu propia cuenta.');

        $user->delete();

        return response()->json(['message' => 'Usuario eliminado.']);
    }

    /** GET /api/admin/roles */
    public function roles(): JsonResponse
    {
        return response()->json([
            'data' => Role::all()->map(fn (Role $role) => [
                'id' => $role->id,
                'name' => $role->name->value,
                'label' => $role->label,
                'description' => $role->description,
                'permissions' => $role->permissions,
            ]),
        ]);
    }
}
