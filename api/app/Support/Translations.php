<?php

namespace App\Support;

/**
 * Textos traducibles. Cada modelo guarda en la columna `translations` las
 * versiones en otros idiomas de sus campos de texto, con esta forma:
 *
 *     { "en": { "name": "Grill", "description": "…" } }
 *
 * El español vive en las columnas normales y es el respaldo: un campo sin
 * traducir se muestra en español en la versión en inglés del sitio.
 */
class Translations
{
    /** Idiomas adicionales al español. */
    public const LOCALES = ['en'];

    /**
     * Reglas de validación para `translations.<idioma>.<campo>`.
     *
     * @param  array<string, string|array<int, string>>  $fields  campo => reglas extra (p. ej. 'max:120')
     * @return array<string, array<int, string>>
     */
    public static function rules(array $fields): array
    {
        $rules = ['translations' => ['sometimes', 'nullable', 'array']];

        foreach (self::LOCALES as $locale) {
            $rules["translations.{$locale}"] = ['nullable', 'array'];

            foreach ($fields as $field => $extra) {
                $rules["translations.{$locale}.{$field}"] = array_merge(['nullable'], (array) $extra);
            }
        }

        return $rules;
    }
}
