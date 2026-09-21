import { api } from '@/lib/api'
import type {
  BlockedDate,
  CalendarPayload,
  Customer,
  DashboardPayload,
  GalleryImage,
  Paginated,
  Payment,
  PricingMeta,
  PricingRule,
  Ranch,
  Reservation,
  Role,
  Service,
  Testimonial,
  AuthUser,
} from '@/types'

export interface ReservationFilters {
  status?: string
  from?: string
  to?: string
  search?: string
  customer_id?: number
  page?: number
  per_page?: number
}

export const dashboardService = {
  async summary() {
    const { data } = await api.get<{ data: DashboardPayload }>('/admin/dashboard')
    return data.data
  },
}

export const calendarService = {
  async month(month: string) {
    const { data } = await api.get<{ data: CalendarPayload }>('/admin/calendar', {
      params: { month },
    })
    return data.data
  },

  async block(input: { start_date: string; end_date: string; reason?: string }) {
    const { data } = await api.post<{ message: string; data: BlockedDate }>(
      '/admin/calendar/block',
      input,
    )
    return data
  },

  async unblock(id: number) {
    const { data } = await api.delete<{ message: string }>(`/admin/calendar/block/${id}`)
    return data
  },
}

export const reservationService = {
  async list(filters: ReservationFilters) {
    const { data } = await api.get<Paginated<Reservation>>('/admin/reservations', {
      params: filters,
    })
    return data
  },

  async get(id: number) {
    const { data } = await api.get<{ data: Reservation }>(`/admin/reservations/${id}`)
    return data.data
  },

  async create(input: Record<string, unknown>) {
    const { data } = await api.post<{ message: string; data: Reservation }>(
      '/admin/reservations',
      input,
    )
    return data
  },

  async update(id: number, input: Record<string, unknown>) {
    const { data } = await api.put<{ message: string; data: Reservation }>(
      `/admin/reservations/${id}`,
      input,
    )
    return data
  },

  async confirm(id: number) {
    const { data } = await api.post<{ message: string; data: Reservation }>(
      `/admin/reservations/${id}/confirm`,
    )
    return data
  },

  async cancel(id: number, reason?: string) {
    const { data } = await api.post<{ message: string; data: Reservation }>(
      `/admin/reservations/${id}/cancel`,
      { reason },
    )
    return data
  },

  async complete(id: number) {
    const { data } = await api.post<{ message: string; data: Reservation }>(
      `/admin/reservations/${id}/complete`,
    )
    return data
  },
}

export const customerService = {
  async list(params: { search?: string; page?: number }) {
    const { data } = await api.get<Paginated<Customer>>('/admin/customers', { params })
    return data
  },

  async get(id: number) {
    const { data } = await api.get<{ data: Customer }>(`/admin/customers/${id}`)
    return data.data
  },

  async create(input: Partial<Customer>) {
    const { data } = await api.post<{ message: string; data: Customer }>('/admin/customers', input)
    return data
  },

  async update(id: number, input: Partial<Customer>) {
    const { data } = await api.put<{ message: string; data: Customer }>(
      `/admin/customers/${id}`,
      input,
    )
    return data
  },
}

export interface PaymentsPage extends Paginated<Reservation> {
  summary: { total: number; paid: number; balance: number; filtered_by_status: string | null }
}

export const paymentService = {
  async list(params: { search?: string; status?: string; page?: number }) {
    const { data } = await api.get<PaymentsPage>('/admin/payments', { params })
    return data
  },

  async create(input: {
    reservation_id: number
    amount: number
    method: string
    paid_at: string
    reference?: string
    notes?: string
  }) {
    const { data } = await api.post<{
      message: string
      data: Payment
      reservation: Reservation
    }>('/admin/payments', input)
    return data
  },
}

export const contentService = {
  async services() {
    const { data } = await api.get<{ data: Service[] }>('/admin/services')
    return data.data
  },
  async createService(input: Partial<Service>) {
    const { data } = await api.post<{ message: string; data: Service }>('/admin/services', input)
    return data
  },
  async updateService(id: number, input: Partial<Service>) {
    const { data } = await api.put<{ message: string; data: Service }>(
      `/admin/services/${id}`,
      input,
    )
    return data
  },
  async deleteService(id: number) {
    const { data } = await api.delete<{ message: string }>(`/admin/services/${id}`)
    return data
  },

  async gallery() {
    const { data } = await api.get<{ data: GalleryImage[] }>('/admin/gallery')
    return data.data
  },
  async createImage(input: FormData | Partial<GalleryImage>) {
    const { data } = await api.post<{ message: string; data: GalleryImage }>(
      '/admin/gallery',
      input,
    )
    return data
  },
  async updateImage(id: number, input: Partial<GalleryImage>) {
    const { data } = await api.put<{ message: string; data: GalleryImage }>(
      `/admin/gallery/${id}`,
      input,
    )
    return data
  },
  async deleteImage(id: number) {
    const { data } = await api.delete<{ message: string }>(`/admin/gallery/${id}`)
    return data
  },
  async reorderGallery(items: { id: number; sort_order: number }[]) {
    const { data } = await api.post<{ message: string }>('/admin/gallery/reorder', { items })
    return data
  },

  async testimonials() {
    const { data } = await api.get<{ data: Testimonial[] }>('/admin/testimonials')
    return data.data
  },
  async createTestimonial(input: Partial<Testimonial>) {
    const { data } = await api.post<{ message: string; data: Testimonial }>(
      '/admin/testimonials',
      input,
    )
    return data
  },
  async updateTestimonial(id: number, input: Partial<Testimonial>) {
    const { data } = await api.put<{ message: string; data: Testimonial }>(
      `/admin/testimonials/${id}`,
      input,
    )
    return data
  },
  async deleteTestimonial(id: number) {
    const { data } = await api.delete<{ message: string }>(`/admin/testimonials/${id}`)
    return data
  },
}

export const settingsService = {
  async get() {
    const { data } = await api.get<{ data: Ranch }>('/admin/settings')
    return data.data
  },
  async update(input: Record<string, unknown>) {
    const { data } = await api.put<{ message: string; data: Ranch }>('/admin/settings', input)
    return data
  },
}

export const pricingService = {
  async list() {
    const { data } = await api.get<{ data: PricingRule[]; meta: PricingMeta }>('/admin/pricing')
    return data
  },
  async create(input: Partial<PricingRule>) {
    const { data } = await api.post<{ message: string; data: PricingRule }>('/admin/pricing', input)
    return data
  },
  async update(id: number, input: Partial<PricingRule>) {
    const { data } = await api.put<{ message: string; data: PricingRule }>(
      `/admin/pricing/${id}`,
      input,
    )
    return data
  },
  async remove(id: number) {
    const { data } = await api.delete<{ message: string }>(`/admin/pricing/${id}`)
    return data
  },
  async simulate(date: string, guests: number) {
    const { data } = await api.post<{ data: { total: number; deposit: number; lines: unknown[] } }>(
      '/admin/pricing/simulate',
      { date, guests },
    )
    return data.data
  },
}

export const userService = {
  async list() {
    const { data } = await api.get<{ data: AuthUser[] }>('/admin/users')
    return data.data
  },
  async roles() {
    const { data } = await api.get<{ data: Role[] }>('/admin/roles')
    return data.data
  },
  async create(input: Record<string, unknown>) {
    const { data } = await api.post<{ message: string; data: AuthUser }>('/admin/users', input)
    return data
  },
  async update(id: number, input: Record<string, unknown>) {
    const { data } = await api.put<{ message: string; data: AuthUser }>(`/admin/users/${id}`, input)
    return data
  },
  async remove(id: number) {
    const { data } = await api.delete<{ message: string }>(`/admin/users/${id}`)
    return data
  },
}
