<?php

/*
| Mensajes de validación en español. Los mensajes específicos de cada
| formulario viven en su FormRequest (App\Http\Requests).
*/

return [
    'accepted' => 'Debés aceptar :attribute.',
    'after' => ':Attribute debe ser posterior a :date.',
    'after_or_equal' => ':Attribute debe ser igual o posterior a :date.',
    'array' => ':Attribute debe ser una lista.',
    'before' => ':Attribute debe ser anterior a :date.',
    'before_or_equal' => ':Attribute debe ser igual o anterior a :date.',
    'between' => [
        'numeric' => ':Attribute debe estar entre :min y :max.',
        'string' => ':Attribute debe tener entre :min y :max caracteres.',
        'array' => ':Attribute debe tener entre :min y :max elementos.',
    ],
    'boolean' => ':Attribute debe ser verdadero o falso.',
    'confirmed' => 'La confirmación de :attribute no coincide.',
    'date' => ':Attribute no es una fecha válida.',
    'date_format' => ':Attribute no coincide con el formato :format.',
    'different' => ':Attribute y :other deben ser diferentes.',
    'email' => ':Attribute debe ser un correo válido.',
    'exists' => ':Attribute seleccionado no existe.',
    'file' => ':Attribute debe ser un archivo.',
    'gte' => [
        'numeric' => ':Attribute debe ser mayor o igual a :value.',
    ],
    'image' => ':Attribute debe ser una imagen.',
    'in' => ':Attribute seleccionado no es válido.',
    'integer' => ':Attribute debe ser un número entero.',
    'max' => [
        'numeric' => ':Attribute no puede ser mayor que :max.',
        'file' => ':Attribute no puede pesar más de :max kilobytes.',
        'string' => ':Attribute no puede tener más de :max caracteres.',
        'array' => ':Attribute no puede tener más de :max elementos.',
    ],
    'mimes' => ':Attribute debe ser un archivo de tipo: :values.',
    'min' => [
        'numeric' => ':Attribute debe ser al menos :min.',
        'file' => ':Attribute debe pesar al menos :min kilobytes.',
        'string' => ':Attribute debe tener al menos :min caracteres.',
        'array' => ':Attribute debe tener al menos :min elementos.',
    ],
    'numeric' => ':Attribute debe ser un número.',
    'required' => 'El campo :attribute es obligatorio.',
    'required_if' => 'El campo :attribute es obligatorio cuando :other es :value.',
    'required_without' => 'El campo :attribute es obligatorio cuando :values no está presente.',
    'string' => ':Attribute debe ser texto.',
    'unique' => ':Attribute ya está registrado.',
    'url' => ':Attribute debe ser una URL válida.',

    'password' => [
        'letters' => 'La contraseña debe contener al menos una letra.',
        'mixed' => 'La contraseña debe contener mayúsculas y minúsculas.',
        'numbers' => 'La contraseña debe contener al menos un número.',
        'symbols' => 'La contraseña debe contener al menos un símbolo.',
    ],

    'attributes' => [
        'full_name' => 'nombre completo',
        'phone' => 'teléfono',
        'email' => 'correo',
        'password' => 'contraseña',
        'event_date' => 'fecha del evento',
        'start_time' => 'hora de entrada',
        'end_time' => 'hora de salida',
        'guests' => 'cantidad de personas',
        'event_type' => 'tipo de evento',
        'notes' => 'comentarios',
        'internal_notes' => 'notas internas',
        'amount' => 'monto',
        'method' => 'método de pago',
        'paid_at' => 'fecha de pago',
        'start_date' => 'fecha de inicio',
        'end_date' => 'fecha final',
        'name' => 'nombre',
        'description' => 'descripción',
        'capacity' => 'capacidad',
        'address' => 'dirección',
        'role_id' => 'rol',
    ],
];
