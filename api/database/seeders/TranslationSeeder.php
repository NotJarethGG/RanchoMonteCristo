<?php

namespace Database\Seeders;

use App\Support\EnglishDefaults;
use Illuminate\Database\Seeder;

/** Traducción al inglés de los datos de ejemplo. Va al final del seeder. */
class TranslationSeeder extends Seeder
{
    public function run(): void
    {
        EnglishDefaults::apply();
    }
}
