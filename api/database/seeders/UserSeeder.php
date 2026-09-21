<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Role::where('name', RoleName::Admin->value)->firstOrFail();
        $staff = Role::where('name', RoleName::Staff->value)->firstOrFail();

        User::updateOrCreate(
            ['email' => 'admin@ranchomontecristo.com'],
            [
                'role_id' => $admin->id,
                'name' => 'Carlos Montealegre',
                'password' => 'password123',
                'phone' => '+506 8888-1122',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );

        User::updateOrCreate(
            ['email' => 'staff@ranchomontecristo.com'],
            [
                'role_id' => $staff->id,
                'name' => 'Daniela Rojas',
                'password' => 'password123',
                'phone' => '+506 8888-3344',
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
    }
}
