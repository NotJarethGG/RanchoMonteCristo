/*
 * Contratos de la API. Reflejan exactamente los App\Http\Resources de Laravel.
 */

// ---------------------------------------------------------------- Comunes

export interface Paginated<T> {
  data: T[]
  links: { first: string | null; last: string | null; prev: string | null; next: string | null }
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
  }
}

export interface ApiMessage<T = unknown> {
  message: string
  data: T
}

export interface ApiErrorBody {
  message: string
  errors?: Record<string, string[]>
}

// ---------------------------------------------------------------- Rancho

export interface Ranch {
  id: number
  name: string
  slug: string
  tagline: string | null
  description: string | null
  about: string | null
  contact: { phone: string | null; whatsapp: string | null; email: string | null }
  location: {
    address: string | null
    city: string | null
    province: string | null
    latitude: number | null
    longitude: number | null
    google_maps_url: string | null
  }
  capacity: number
  check_in_time: string | null
  check_out_time: string | null
  schedule: { day: string; hours: string }[]
  socials: Record<string, string | null>
  event_types: string[]
  areas: string[]
  policies: string | null
  hero_image: string | null
  currency: string
  currency_symbol: string
}

export interface Service {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string
  image: string | null
  is_active: boolean
  sort_order: number
}

export interface GalleryImage {
  id: number
  title: string | null
  caption: string | null
  alt: string | null
  url: string
  category: string | null
  is_featured: boolean
  is_active: boolean
  sort_order: number
}

export interface Testimonial {
  id: number
  author_name: string
  event_type: string | null
  rating: number
  content: string
  avatar: string | null
  event_date: string | null
  is_published: boolean
  sort_order: number
}

export interface LandingPayload {
  ranch: Ranch
  services: Service[]
  gallery: GalleryImage[]
  testimonials: Testimonial[]
}

// ---------------------------------------------------------------- Disponibilidad

export type DayStatus = 'available' | 'pending' | 'reserved' | 'blocked' | 'past'

export interface AvailabilityDay {
  date: string
  status: DayStatus
  /** El sitio público solo permite elegir días con `requestable`. */
  requestable: boolean
  reservations: number
}

export interface QuoteLine {
  rule_id: number
  name: string
  type: string
  amount_type: string
  amount: number
  computed: number
}

export interface Quote {
  total: number
  deposit: number
  currency: string
  lines: QuoteLine[]
}

// ---------------------------------------------------------------- Reservas

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatusValue = 'pending' | 'partial' | 'paid'
export type PaymentMethodValue = 'cash' | 'transfer' | 'sinpe' | 'card' | 'other'

export interface Customer {
  id: number
  full_name: string
  phone: string
  email: string | null
  identification?: string | null
  notes?: string | null
  reservations_count?: number
  last_reservation_at?: string | null
  reservations?: Reservation[]
  created_at?: string
}

export interface Payment {
  id: number
  reservation_id: number
  amount: number
  method: PaymentMethodValue
  method_label: string
  reference: string | null
  receipt: string | null
  paid_at: string | null
  notes: string | null
  recorded_by?: string | null
  reservation?: Reservation
  created_at?: string
}

export interface Reservation {
  id: number
  code: string
  event_date: string
  start_time: string
  end_time: string
  guests: number
  event_type: string | null
  notes: string | null
  internal_notes?: string | null
  status: ReservationStatus
  status_label: string
  source: string
  totals: {
    total: number
    deposit: number
    paid: number
    balance: number
    payment_status: PaymentStatusValue
    payment_status_label: string
  }
  pricing_breakdown: QuoteLine[]
  customer?: Customer
  payments?: Payment[]
  created_by?: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string | null
}

export interface BlockedDate {
  id: number
  start_date: string
  end_date: string
  reason: string | null
  created_by?: string | null
}

// ---------------------------------------------------------------- Dashboard

export interface DashboardStats {
  reservations_this_month: number
  pending: number
  confirmed: number
  income_this_month: number
  pending_balance: number
  occupancy_rate: number
}

export interface DashboardPayload {
  stats: DashboardStats
  next_reservation: Reservation | null
  upcoming: Reservation[]
  monthly_series: { month: string; key: string; reservations: number; income: number }[]
  currency: string
}

export interface CalendarPayload {
  month: string
  days: AvailabilityDay[]
  reservations: Reservation[]
  blocked_dates: BlockedDate[]
}

// ---------------------------------------------------------------- Precios

export type PricingRuleType =
  | 'base' | 'weekday' | 'weekend' | 'date_range' | 'season' | 'holiday' | 'per_person'
export type AmountType = 'fixed' | 'per_person' | 'percentage'

export interface PricingRule {
  id: number
  name: string
  type: PricingRuleType
  type_label: string
  amount_type: AmountType
  amount_type_label: string
  amount: number
  starts_on: string | null
  ends_on: string | null
  weekdays: number[] | null
  min_guests: number | null
  max_guests: number | null
  priority: number
  is_active: boolean
  description: string | null
}

export interface PricingMeta {
  types: { value: string; label: string }[]
  amount_types: { value: string; label: string }[]
  deposit_percentage: number
  currency: string
}

// ---------------------------------------------------------------- Usuarios

export type RoleValue = 'admin' | 'staff'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  is_active: boolean
  role: RoleValue
  role_label: string
  permissions: string[]
  last_login_at: string | null
}

export interface LoginResponse {
  token: string
  expires_at: string
  user: AuthUser
}

export interface Role {
  id: number
  name: RoleValue
  label: string
  description: string | null
  permissions: string[]
}
