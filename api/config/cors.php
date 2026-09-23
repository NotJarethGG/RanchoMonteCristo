<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ]),

    // Solo los previews de ESTE proyecto en Vercel. El patrón anterior
    // (`*.vercel.app`) aceptaba cualquier sitio alojado ahí, de cualquier persona.
    'allowed_origins_patterns' => ['#^https://rancho-monte-cristo[a-z0-9-]*\.vercel\.app$#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // La autenticación es por token Bearer, no por cookies: no hace falta
    // habilitar credenciales en CORS, y no habilitarlas reduce la superficie.
    'supports_credentials' => false,
];
