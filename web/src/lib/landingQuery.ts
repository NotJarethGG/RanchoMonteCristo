import { qk } from '@/lib/queryClient'
import { publicService } from '@/services/public.service'
import type { LandingPayload } from '@/types'

// Módulo aparte y liviano: main.tsx lo importa para precargar la portada, y no
// debe arrastrar al paquete inicial lo que usan los hooks (date-fns, etc.).

/*
 * La última respuesta de la portada se guarda en el navegador. En la próxima
 * visita la página se pinta completa al instante con esos datos mientras se
 * piden los frescos: con el plan gratuito de Render, que tarda en despertar,
 * es la diferencia entre ver el sitio y mirar un spinner. Solo se guarda
 * contenido público (el rancho, servicios, galería y testimonios).
 */
// v2: la respuesta trae las traducciones al inglés.
const LANDING_CACHE_KEY = 'rmc.landing.v2'
const LANDING_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

export function readCachedLanding(): LandingPayload | undefined {
  try {
    const raw = localStorage.getItem(LANDING_CACHE_KEY)
    if (!raw) return undefined
    const { savedAt, data } = JSON.parse(raw) as { savedAt: number; data: LandingPayload }
    return Date.now() - savedAt < LANDING_CACHE_MAX_AGE ? data : undefined
  } catch {
    return undefined
  }
}

async function fetchLanding() {
  const data = await publicService.landing()
  try {
    localStorage.setItem(LANDING_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Modo privado o almacenamiento lleno: la caché es opcional.
  }
  return data
}

/** Compartido con la precarga de main.tsx, para que ambas escriban la caché. */
export const landingQuery = {
  queryKey: qk.landing,
  queryFn: fetchLanding,
  staleTime: 5 * 60_000,
}

