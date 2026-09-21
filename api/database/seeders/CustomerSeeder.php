<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            ['full_name' => 'María Fernanda Solís', 'phone' => '+50683214455', 'email' => 'mf.solis@example.com'],
            ['full_name' => 'Jorge Álvarez Mora', 'phone' => '+50688776655', 'email' => 'jorge.alvarez@example.com'],
            ['full_name' => 'Karla Ureña Vargas', 'phone' => '+50670112233', 'email' => 'karla.urena@example.com'],
            ['full_name' => 'Andrea Campos', 'phone' => '+50661223344', 'email' => 'andrea.campos@example.com'],
            ['full_name' => 'Sebastián Núñez', 'phone' => '+50689990011', 'email' => null],
            ['full_name' => 'Cooperativa El Roble', 'phone' => '+50622334455', 'email' => 'eventos@elroble.example.com'],
        ];

        foreach ($customers as $customer) {
            Customer::updateOrCreate(['phone' => $customer['phone']], $customer);
        }
    }
}
