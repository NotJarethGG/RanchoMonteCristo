import { useMutation, useQuery } from '@tanstack/react-query'
import { format, addMonths, startOfMonth, endOfMonth } from 'date-fns'
import { qk } from '@/lib/queryClient'
import { publicService, type ReservationRequestInput } from '@/services/public.service'
import { normalizeError } from '@/lib/api'

export function useLanding() {
  return useQuery({
    queryKey: qk.landing,
    queryFn: publicService.landing,
    staleTime: 5 * 60_000,
  })
}

/** Trae el mes visible más el siguiente, para que navegar se sienta instantáneo. */
export function useAvailability(month: Date) {
  const from = format(startOfMonth(month), 'yyyy-MM-dd')
  const to = format(endOfMonth(addMonths(month, 1)), 'yyyy-MM-dd')

  return useQuery({
    queryKey: qk.availability(from, to),
    queryFn: () => publicService.availability(from, to),
    placeholderData: (previous) => previous,
  })
}

export function useQuote(date: string | null, guests: number) {
  return useQuery({
    queryKey: qk.quote(date ?? '', guests),
    queryFn: () => publicService.quote(date!, guests),
    enabled: !!date && guests > 0,
  })
}

export function useRequestReservation() {
  return useMutation({
    mutationFn: (input: ReservationRequestInput) => publicService.requestReservation(input),
    onError: (error) => normalizeError(error),
  })
}
