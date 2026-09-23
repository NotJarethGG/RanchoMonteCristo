import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { PaymentStatusValue, ReservationStatus, DayStatus } from '@/types'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'gold'

const tones: Record<Tone, string> = {
  neutral: 'bg-sand-200/70 text-stone-700 ring-stone-600/15',
  success: 'bg-ok-100 text-ok-600 ring-ok-600/20',
  warning: 'bg-warn-100 text-warn-600 ring-warn-600/20',
  danger: 'bg-danger-100 text-danger-600 ring-danger-600/20',
  info: 'bg-sage-100 text-forest-700 ring-forest-700/15',
  gold: 'bg-gold-100 text-gold-600 ring-gold-600/25',
}

export function Badge({
  tone = 'neutral',
  children,
  className,
  dot,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
  dot?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

const reservationTone: Record<ReservationStatus, Tone> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
  completed: 'info',
}

export function StatusBadge({ status, label }: { status: ReservationStatus; label?: string }) {
  const labels: Record<ReservationStatus, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Finalizada',
  }
  return (
    <Badge tone={reservationTone[status]} dot>
      {label ?? labels[status]}
    </Badge>
  )
}

const paymentTone: Record<PaymentStatusValue, Tone> = {
  pending: 'danger',
  partial: 'warning',
  paid: 'success',
}

export function PaymentBadge({ status, label }: { status: PaymentStatusValue; label?: string }) {
  const labels: Record<PaymentStatusValue, string> = {
    pending: 'Pendiente',
    partial: 'Parcial',
    paid: 'Pagado',
  }
  return <Badge tone={paymentTone[status]}>{label ?? labels[status]}</Badge>
}

/** Colores del calendario, compartidos entre sitio público y dashboard. */
export const dayStatusStyles: Record<DayStatus, { dot: string; label: string; cell: string }> = {
  available: {
    dot: 'bg-ok-600',
    label: 'Disponible',
    cell: 'bg-white text-forest-900 hover:border-clay-500 hover:bg-clay-100/40',
  },
  pending: {
    dot: 'bg-warn-600',
    label: 'Pendiente',
    cell: 'bg-warn-100 text-warn-600 border-warn-600/25',
  },
  reserved: {
    dot: 'bg-danger-600',
    label: 'Reservado',
    cell: 'bg-danger-100 text-danger-600 border-danger-600/25',
  },
  blocked: {
    dot: 'bg-stone-600',
    label: 'No disponible',
    cell: 'bg-sand-200 text-stone-600 border-stone-600/20',
  },
  past: { dot: 'bg-sand-300', label: 'Pasado', cell: 'bg-transparent text-sand-300' },
}

/** Solicitud hecha desde la versión en inglés del sitio: hay que contestarle en inglés. */
export function LocaleBadge({ locale }: { locale?: string }) {
  if (locale !== 'en') return null
  return (
    <Badge tone="info">
      <span title="La pidió desde la página en inglés">Inglés</span>
    </Badge>
  )
}
