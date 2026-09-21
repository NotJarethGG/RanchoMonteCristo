import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // No reintentar errores de cliente (401/403/404/422).
        const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0
        if (status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
  },
})

/** Claves de caché centralizadas para evitar strings sueltos. */
export const qk = {
  landing: ['landing'] as const,
  availability: (from: string, to: string) => ['availability', from, to] as const,
  quote: (date: string, guests: number) => ['quote', date, guests] as const,

  me: ['auth', 'me'] as const,
  dashboard: ['admin', 'dashboard'] as const,
  calendar: (month: string) => ['admin', 'calendar', month] as const,
  reservations: (filters: unknown) => ['admin', 'reservations', filters] as const,
  reservation: (id: number) => ['admin', 'reservation', id] as const,
  customers: (filters: unknown) => ['admin', 'customers', filters] as const,
  customer: (id: number) => ['admin', 'customer', id] as const,
  payments: (filters: unknown) => ['admin', 'payments', filters] as const,
  services: ['admin', 'services'] as const,
  gallery: ['admin', 'gallery'] as const,
  testimonials: ['admin', 'testimonials'] as const,
  pricing: ['admin', 'pricing'] as const,
  settings: ['admin', 'settings'] as const,
  users: ['admin', 'users'] as const,
  roles: ['admin', 'roles'] as const,
}
