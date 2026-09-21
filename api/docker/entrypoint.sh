#!/usr/bin/env bash
set -e

# Render asigna el puerto por $PORT; Apache debe escuchar ahí.
APACHE_PORT="${PORT:-10000}"
sed -i "s/^Listen .*/Listen ${APACHE_PORT}/" /etc/apache2/ports.conf
sed -i "s/__PORT__/${APACHE_PORT}/g" /etc/apache2/sites-available/000-default.conf

# Enlace para servir las imágenes subidas desde el dashboard.
php artisan storage:link --force >/dev/null 2>&1 || true

# Migraciones al arrancar. Son idempotentes, pero si preferís correrlas a mano
# desde la consola de Render, poné RUN_MIGRATIONS=false en las variables.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    php artisan migrate --force --no-interaction
fi

# Cachés de producción. Se generan en el arranque y no antes, porque dependen
# de las variables de entorno que Render inyecta en tiempo de ejecución.
php artisan config:cache
php artisan route:cache

exec "$@"
