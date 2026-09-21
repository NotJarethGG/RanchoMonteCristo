import { api } from '@/lib/api'
import type { AvailabilityDay, LandingPayload, Quote, Ranch, Reservation } from '@/types'

export interface ReservationRequestInput {
  full_name: string
  phone: string
  email?: string
  event_date: string
  start_time: string
  end_time: string
  guests: number
  event_type?: string
  notes?: string
}

export const publicService = {
  async landing() {
    const { data } = await api.get<{ data: LandingPayload }>('/landing')
    return data.data
  },

  async ranch() {
    const { data } = await api.get<{ data: Ranch }>('/ranch')
    return data.data
  },

  async availability(from: string, to: string) {
    const { data } = await api.get<{ data: AvailabilityDay[] }>('/availability', {
      params: { from, to },
    })
    return data.data
  },

  async quote(date: string, guests: number) {
    const { data } = await api.get<{ data: { available: boolean; quote: Quote } }>(
      '/availability/quote',
      { params: { date, guests } },
    )
    return data.data
  },

  async requestReservation(input: ReservationRequestInput) {
    const { data } = await api.post<{ message: string; data: Reservation }>('/reservations', input)
    return data
  },
}
