/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API Laravel. Vacía en desarrollo (se usa el proxy de Vite). */
  readonly VITE_API_URL?: string
  /** Clave opcional de Google Maps para el mapa embebido. */
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
