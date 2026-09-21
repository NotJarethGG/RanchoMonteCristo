import axios, { AxiosError } from 'axios'
import type { ApiErrorBody } from '@/types'

const TOKEN_KEY = 'rmc.token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY),
  set: (token: string, persist: boolean) => {
    tokenStorage.clear()
    ;(persist ? localStorage : sessionStorage).setItem(TOKEN_KEY, token)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
  },
}

export const api = axios.create({
  // En desarrollo se usa el proxy de Vite; en producción, VITE_API_URL.
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
  timeout: 20_000,
})

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

/** Evento global para que el AuthProvider cierre sesión ante un 401. */
export const UNAUTHORIZED_EVENT = 'rmc:unauthorized'

/**
 * Si la respuesta es HTML donde se esperaba JSON, casi siempre significa que
 * `VITE_API_URL` apunta al propio sitio y no al backend: el hosting devuelve
 * index.html con estado 200. Sin este control el fallo llega disfrazado de
 * error de red y manda a buscar por el lado equivocado.
 */
api.interceptors.response.use((response) => {
  const tipo = String(response.headers['content-type'] ?? '')

  if (typeof response.data === 'string' && !tipo.includes('json')) {
    throw new Error(
      'La API devolvió HTML en lugar de JSON. Revisá VITE_API_URL: parece apuntar ' +
        'al propio sitio en vez del backend.',
    )
  }

  return response
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401 && tokenStorage.get()) {
      tokenStorage.clear()
      window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT))
    }
    return Promise.reject(error)
  },
)

/** Error normalizado: una sola forma para toda la UI. */
export interface NormalizedError {
  status: number
  message: string
  errors: Record<string, string[]>
}

export function normalizeError(error: unknown): NormalizedError {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return {
        status: 0,
        message: 'No pudimos conectar con el servidor. Revisá tu conexión.',
        errors: {},
      }
    }
    return {
      status: error.response.status,
      message: error.response.data?.message ?? 'Ocurrió un error inesperado.',
      errors: error.response.data?.errors ?? {},
    }
  }

  // Errores que no vienen de axios (por ejemplo el de HTML de arriba)
  // conservan su mensaje, que suele ser el más útil para diagnosticar.
  if (error instanceof Error && error.message) {
    return { status: 0, message: error.message, errors: {} }
  }

  return { status: 0, message: 'Ocurrió un error inesperado.', errors: {} }
}

/** Primer mensaje de error de un campo, para pintar formularios del servidor. */
export function fieldError(errors: Record<string, string[]>, field: string) {
  return errors[field]?.[0]
}
