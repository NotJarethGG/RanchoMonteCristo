import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Users } from 'lucide-react'
import { LocaleBadge, PaymentBadge, StatusBadge } from '@/components/ui/Badge'
import { formatDateShort, formatMoney, formatTimeRange } from '@/lib/format'
import type { Reservation } from '@/types'

/**
 * Presentación móvil de una reserva. El dashboard no comprime la tabla de
 * escritorio: en pantallas pequeñas se listan estas tarjetas.
 */
export function ReservationCard({ reservation }: { reservation: Reservation }) {
  return (
    <Link
      to={`/admin/reservas/${reservation.id}`}
      className="block rounded-xl2 border border-forest-900/8 bg-white p-4 shadow-soft transition-shadow active:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-forest-900">
            {reservation.customer?.full_name ?? 'Sin cliente'}
          </p>
          <p className="mt-0.5 font-mono text-xs text-stone-600">{reservation.code}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge status={reservation.status} label={reservation.status_label} />
          <LocaleBadge locale={reservation.locale} />
        </div>
      </div>

      <dl className="mt-3.5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2 text-stone-700">
          <CalendarDays className="size-3.5 shrink-0 text-stone-600/60" />
          {formatDateShort(reservation.event_date)}
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <Users className="size-3.5 shrink-0 text-stone-600/60" />
          {reservation.guests} personas
        </div>
        <div className="col-span-2 text-xs text-stone-600">
          {formatTimeRange(reservation.start_time, reservation.end_time)}
          {reservation.event_type && ` · ${reservation.event_type}`}
        </div>
      </dl>

      <div className="mt-3.5 flex items-center justify-between border-t border-forest-900/6 pt-3.5">
        <div>
          <p className="font-display text-lg text-forest-900">
            {formatMoney(reservation.totals.total)}
          </p>
          <p className="text-xs text-stone-600">
            Saldo {formatMoney(reservation.totals.balance)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentBadge
            status={reservation.totals.payment_status}
            label={reservation.totals.payment_status_label}
          />
          <ChevronRight className="size-4 text-stone-600/50" />
        </div>
      </div>
    </Link>
  )
}
