<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            RanchSeeder::class,
            ServiceSeeder::class,
            GallerySeeder::class,
            TestimonialSeeder::class,
            PricingRuleSeeder::class,
            CustomerSeeder::class,
            ReservationSeeder::class,
            TranslationSeeder::class,
        ]);
    }
}
