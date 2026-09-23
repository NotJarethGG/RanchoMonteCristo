# Rancho Montecristo

Aplicación web para el alquiler del rancho: sitio público orientado a conversión
y dashboard administrativo para gestionar reservas, clientes, pagos y contenido.

```
Rancho MonteCristo/
├── api/     Laravel 12 · API REST · MySQL · Sanctum
└── web/     React 19 + Vite + TypeScript + Tailwind v4
```

---

## 1. Puesta en marcha

### Backend (`api/`)

```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
```

#### Base de datos

El proyecto corre igual sobre **MySQL/MariaDB** o **PostgreSQL (Supabase)**;
se cambia con las variables `DB_*` del `.env` (ver `.env.example`).

**Opción A — MySQL local (XAMPP → *Manager* → arrancar MySQL):**

```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root -e "CREATE DATABASE rancho_montecristo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Migraciones + datos demo, y a correr:

```bash
php artisan migrate:fresh --seed
php artisan storage:link      # para las imágenes que se suban desde el dashboard
php artisan serve             # http://127.0.0.1:8000
```

**Opción B — PostgreSQL en Supabase:**

Copiá la cadena de *Project Settings → Database → **Connection pooling*** y
completá el `.env`:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=aws-0-<region>.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.<project-ref>
DB_PASSWORD=<contraseña de la base>
DB_SSLMODE=require
```

> ⚠️ **Usá el pooler, no la conexión directa.** El host `db.<ref>.supabase.co`
> resuelve únicamente a IPv6, así que falla desde cualquier red o hosting sin
> IPv6 (la mayoría). El pooler en el puerto 5432 es IPv4 y funciona en modo
> sesión, que es lo que Laravel necesita.

Después, igual que en MySQL: `php artisan migrate --seed`.

> **Sin base de datos a mano:** el proyecto trae una conexión `sqlite` lista.
> `touch database/database.sqlite && DB_CONNECTION=sqlite php artisan migrate:fresh --seed`
> y luego `DB_CONNECTION=sqlite php artisan serve`.

### Frontend (`web/`)

```bash
cd web
npm install
cp .env.example .env
npm run dev                   # http://localhost:5173
```

En desarrollo Vite hace proxy de `/api` y `/storage` hacia `http://127.0.0.1:8000`,
así que no hay CORS ni URLs absolutas que configurar.

### Cuentas iniciales

El seeder crea un **ADMIN** (`admin@ranchomontecristo.com`) y un **STAFF**
(`staff@ranchomontecristo.com`). La contraseña depende del entorno:

| Entorno | Contraseña |
|---|---|
| `local` / `testing` | `password123`, para no frenar el desarrollo |
| Cualquier otro | `SEED_ADMIN_PASSWORD` / `SEED_STAFF_PASSWORD` si están definidas; si no, **se genera una aleatoria y se imprime una sola vez** en la consola |

Re-ejecutar el seeder nunca pisa la contraseña de un usuario que ya existe.

> ⚠️ Este repositorio es público. Nunca uses en producción una contraseña que
> aparezca en el código. Si una base de producción se sembró alguna vez con
> `password123`, cambiala desde `/admin/usuarios`.

> 🛡️ Si tu `.env` local apunta a la base de **producción**, agregá
> `DB_PROTECTED=true`: bloquea `migrate:fresh`, `db:wipe` y similares, que con
> `APP_ENV=local` Laravel ejecutaría sin pedir confirmación.

---

## 2. Arquitectura

### Backend

| Capa | Dónde | Responsabilidad |
|------|-------|-----------------|
| Rutas | `routes/api.php` | Público vs. `admin` (Sanctum + rol) |
| Controladores | `app/Http/Controllers/Api/{Public,Admin}` | Delgados: validan, delegan, responden |
| Form Requests | `app/Http/Requests` | Validación y autorización por acción |
| Resources | `app/Http/Resources` | Forma exacta del JSON (contrato con el SPA) |
| Servicios | `app/Services` | Reglas de negocio |
| Enums | `app/Enums` | Estados y catálogos tipados |
| Errores | `app/Support/ApiExceptionRenderer` | Toda la API responde `{ message, errors? }` |

Tres servicios concentran la lógica:

- **`AvailabilityService`** — estado de cada día (`available` · `pending` · `reserved` · `blocked` · `past`)
  y si una fecha se puede solicitar (anticipación mínima, bloqueos, choque con otra reserva).
- **`PricingService`** — motor de precios por reglas. Ordena por `priority`, aplica la regla
  `base` y luego los modificadores que calcen con la fecha y la cantidad de personas.
  El desglose se congela dentro de la reserva (`pricing_breakdown`), así cambiar los
  precios no altera reservas ya cotizadas.
- **`ReservationService`** — crea la solicitud dentro de una transacción, reutiliza al
  cliente por teléfono y maneja los cambios de estado.

### Base de datos

```
roles ──< users ──< reservations >── customers
                         │
                         ├──< payments
                         └── ranch_id ──> ranches ──< services
                                                   ├──< gallery_images
                                                   ├──< testimonials
                                                   ├──< blocked_dates
                                                   └──< pricing_rules
```

Decisiones que vale la pena conocer:

- El **estado de pago no se persiste**: se deriva de `sum(payments) vs total_amount`.
  Evita el clásico bug de un campo `paid` desincronizado.
- `customers.phone` es **único**: es la llave natural del cliente en Costa Rica.
  Una solicitud del sitio reutiliza al cliente si el teléfono ya existe.
- Índice compuesto en `reservations (event_date, status)` — el calendario es la
  consulta más caliente de la app.
- `reservations` y `customers` usan **soft deletes**: nunca se pierde el histórico.
- `ranches` es una tabla, no un archivo de config, porque el propietario la edita
  desde `/admin/configuracion`. Lo que *no* se toca desde la UI vive en `config/ranch.php`
  (moneda, % de adelanto, anticipación mínima).
- Las búsquedas del dashboard usan las macros `whereLike` / `orWhereLike`
  (`AppServiceProvider`), que eligen `ILIKE` en PostgreSQL y `LIKE` en MySQL.
  Sin eso, en Postgres buscar «jorge» no encontraría a «Jorge».

### Frontend

```
src/
├── lib/          axios + interceptores, formateadores, queryClient
├── types/        contratos de la API (espejo de los Resources)
├── services/     una función por endpoint, sin React adentro
├── hooks/        React Query + contexto de auth
├── components/
│   ├── ui/       sistema de diseño (Button, Card, Field, Modal, Table…)
│   ├── layout/   navbar y footer públicos, AdminLayout
│   ├── calendar/ MonthCalendar compartido por sitio y dashboard
│   ├── public/   secciones de la homepage
│   └── admin/    piezas del dashboard
├── pages/        una página por ruta, sin lógica de fetch adentro
└── routes/       ProtectedRoute (sesión + rol)
```

- **Estado de servidor** con TanStack Query; claves centralizadas en `lib/queryClient.ts`.
- **Errores centralizados**: `normalizeError()` devuelve siempre `{ status, message, errors }`,
  y un interceptor cierra la sesión ante un 401.
- **Formularios** con react-hook-form + zod; los errores 422 del servidor se pintan
  campo por campo sobre el mismo formulario.
- **Code splitting por ruta**: quien entra a la homepage no descarga el dashboard.
- El calendario es **un solo componente**: el sitio lo usa con `onlyAvailable`,
  el dashboard con eventos por día.

---

## 3. Endpoints

### Públicos

| Método | Ruta | Qué hace |
|--------|------|----------|
| GET | `/api/landing` | Payload completo de la homepage en un solo request |
| GET | `/api/ranch` | Datos del rancho |
| GET | `/api/services` · `/api/gallery` · `/api/testimonials` | Catálogos |
| GET | `/api/availability?from=&to=` | Estado día por día |
| GET | `/api/availability/quote?date=&guests=` | Cotización estimada |
| POST | `/api/reservations` | Solicitud de reserva (queda **pendiente**) |

### Administrativos — `auth:sanctum` + `role:admin,staff`

`/api/auth/login` · `/auth/logout` · `/auth/me`
`/api/admin/dashboard` · `/calendar` · `/calendar/block`
`/api/admin/reservations` (+ `/confirm`, `/cancel`, `/complete`)
`/api/admin/customers` · `/payments`

### Solo ADMIN

`/api/admin/settings` · `/services` · `/gallery` · `/testimonials` · `/pricing` · `/users` · `/roles`
y los borrados de reservas, clientes y pagos.

**Roles:** `STAFF` gestiona la operación diaria (reservas, clientes, pagos, calendario).
`ADMIN` además toca configuración, contenido, precios y usuarios. Los permisos concretos
se definen en `App\Enums\RoleName::permissions()` y viajan en el token de Sanctum.

---

## 4. Despliegue

### Frontend → Vercel

Root directory `web/`. `vercel.json` ya trae el rewrite de SPA y el caché de assets.
Variable de entorno: `VITE_API_URL=https://tu-api.com/api`.

### Backend → Render (Docker)

Render no tiene entorno nativo de PHP, así que la API va en un contenedor.
El repositorio ya trae todo lo necesario:

| Archivo | Para qué |
|---|---|
| `Dockerfile` | Imagen Apache + PHP 8.2 con `pdo_pgsql`, `gd`, `zip` y OPcache. Está en la raíz a propósito: así el contexto de build es el repositorio y Render no necesita configuración extra |
| `api/docker/vhost.conf` | Document root en `public/`, TLS detrás del proxy de Render |
| `api/docker/php.ini` | Límites de subida acordes al máximo de 8 MB de la galería |
| `api/docker/entrypoint.sh` | Fija el puerto de `$PORT`, migra y cachea config y rutas |
| `render.yaml` | Blueprint con el servicio y sus variables |

**Opción A — Blueprint.** En Render: *New → Blueprint* y apuntá al repositorio.
Lee `render.yaml` y crea el servicio. Después completá en el panel las
variables marcadas `sync: false` (las credenciales no van en el repositorio).

**Opción B — A mano.** *New → Web Service*, conectá el repositorio y elegí:

| Campo | Valor |
|---|---|
| Language / Runtime | **Docker** |
| Dockerfile Path | `./Dockerfile` *(por defecto)* |
| Docker Build Context Directory | `.` *(por defecto)* |
| Health Check Path | `/up` |

Variables de entorno mínimas:

```dotenv
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...            # php artisan key:generate --show
APP_URL=https://tu-api.onrender.com
FRONTEND_URL=https://tu-sitio.vercel.app

DB_CONNECTION=pgsql
DB_HOST=aws-0-<region>.pooler.supabase.com
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.<project-ref>
DB_PASSWORD=<contraseña>
DB_SSLMODE=require

LOG_CHANNEL=stderr
```

`FRONTEND_URL` es lo que habilita CORS para el dominio de Vercel
(`config/cors.php`, que además acepta los previews `*.vercel.app`).

> ⚠️ **El disco de Render es efímero.** Las fotos que se suban desde
> `/admin/galeria` se pierden en cada redespliegue o reinicio. Para producción
> real hay que apuntar `FILESYSTEM_DISK` al disco `s3` —ya definido en
> `config/filesystems.php`— con S3 o Cloudflare R2, o contratar un disco
> persistente en Render.

> ℹ️ En el plan gratuito el servicio se suspende tras ~15 minutos sin tráfico;
> la primera visita después de eso tarda cerca de un minuto en responder.

### Backend → cualquier hosting con PHP 8.2+

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan config:cache && php artisan route:cache
```

Apuntá el document root a `api/public/` y usá las mismas variables de arriba.

---

## 5. Extensiones previstas (fuera del MVP)

La arquitectura las contempla sin rediseño:

- **Pagos en línea** — `payments` ya tiene `method` y `reference`; falta el gateway.
- **WhatsApp Business API** — hoy son enlaces `wa.me`; el punto de integración
  natural es un listener sobre los cambios de estado de `Reservation`.
- **Correos transaccionales** — `MAIL_MAILER=log` en desarrollo; los eventos de
  confirmación/cancelación ya están aislados en `ReservationService`.
- **Facturación electrónica** — se apoyaría en `payments` + datos de `customers`.
- **Múltiples propiedades** — todo el esquema ya cuelga de `ranch_id`.
- **Google Maps** — poné `VITE_GOOGLE_MAPS_API_KEY` y el mapa cambia solo
  (sin clave usa OpenStreetMap).
