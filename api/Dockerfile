# ---------------------------------------------------------------------------
# API del Rancho Monte Cristo — imagen para Render
#
# Render no tiene entorno nativo de PHP, así que el despliegue va por Docker.
# Se usa Apache + mod_php: menos piezas que nginx + php-fpm y suficiente para
# una API de este tamaño.
# ---------------------------------------------------------------------------
FROM php:8.2-apache

# --- Dependencias del sistema y extensiones de PHP
# libpq-dev  -> pdo_pgsql (Supabase)
# libzip     -> zip, que composer usa para instalar paquetes
# libpng/jpeg-> gd, para la validación de imágenes de la galería
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        unzip \
        git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        pdo_mysql \
        bcmath \
        zip \
        gd \
        opcache \
    && apt-get purge -y --auto-remove \
    && rm -rf /var/lib/apt/lists/*

# --- Configuración de PHP para producción
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/php.ini "$PHP_INI_DIR/conf.d/99-rancho.ini"

# --- Apache: el document root es public/, no la raíz del proyecto
RUN a2enmod rewrite headers
COPY docker/vhost.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# --- Dependencias de PHP
# Se copian primero los archivos de composer para aprovechar la caché de capas:
# mientras no cambien, `composer install` no se vuelve a ejecutar.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction

# --- Código de la aplicación
COPY . .
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rw storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint

# Render inyecta $PORT; el entrypoint lo aplica a la configuración de Apache.
ENV PORT=10000
EXPOSE 10000

ENTRYPOINT ["entrypoint"]
CMD ["apache2-foreground"]
