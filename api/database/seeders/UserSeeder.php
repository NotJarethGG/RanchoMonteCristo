<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    /**
     * Crea el administrador y el colaborador iniciales.
     *
     * La contraseña NUNCA es fija fuera de desarrollo: el repositorio es
     * público, así que una clave escrita acá sería una clave publicada.
     *   - SEED_ADMIN_PASSWORD / SEED_STAFF_PASSWORD, si están definidas.
     *   - En producción, si no lo están, se genera una aleatoria y se imprime.
     *   - En local, `password123` para no frenar el desarrollo.
     *
     * Si el usuario ya existe no se le toca la contraseña: re-ejecutar el
     * seeder no debe pisar una clave que el propietario ya cambió.
     */
    public function run(): void
    {
        $admin = Role::where('name', RoleName::Admin->value)->firstOrFail();
        $staff = Role::where('name', RoleName::Staff->value)->firstOrFail();

        $this->seedUser('admin@ranchomontecristo.com', 'Carlos Montealegre', $admin, 'SEED_ADMIN_PASSWORD');
        $this->seedUser('staff@ranchomontecristo.com', 'Daniela Rojas', $staff, 'SEED_STAFF_PASSWORD');
    }

    private function seedUser(string $email, string $name, Role $role, string $envKey): void
    {
        $user = User::firstOrNew(['email' => $email]);
        $user->fill(['role_id' => $role->id, 'name' => $name, 'is_active' => true]);

        if (! $user->exists) {
            $password = $this->passwordFor($envKey);
            $user->password = $password['value'];
            $user->email_verified_at = now();

            if ($password['generated']) {
                $this->command?->warn("  Contraseña generada para {$email}: {$password['value']}");
                $this->command?->warn('  Guardala ahora: no se vuelve a mostrar.');
            }
        }

        $user->save();
    }

    /** @return array{value: string, generated: bool} */
    private function passwordFor(string $envKey): array
    {
        if ($value = env($envKey)) {
            return ['value' => $value, 'generated' => false];
        }

        if (app()->environment('local', 'testing')) {
            return ['value' => 'password123', 'generated' => false];
        }

        return ['value' => Str::password(20, symbols: false), 'generated' => true];
    }
}
