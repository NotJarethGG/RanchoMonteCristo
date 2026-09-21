<?php

/*
|--------------------------------------------------------------------------
| Cloudinary
|--------------------------------------------------------------------------
| Almacenamiento de las imágenes de la galería. Sin credenciales el sistema
| sigue funcionando contra el disco local: útil en desarrollo, pero en
| hostings de disco efímero (Render, Fly, Heroku) las fotos se perderían en
| cada redespliegue.
*/

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
    'api_key' => env('CLOUDINARY_API_KEY'),
    'api_secret' => env('CLOUDINARY_API_SECRET'),

    // Carpeta dentro de Cloudinary, para no mezclar con otros proyectos.
    'folder' => env('CLOUDINARY_FOLDER', 'rancho-montecristo'),
];
