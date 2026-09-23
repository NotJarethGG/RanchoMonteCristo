import { useMemo } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { toDate } from '@/lib/format'
import { dayStatusStyles } from '@/components/ui/Badge'

/*
 * Colores de la variante impresa. Los días reservados van tachados con un
 * rayado diagonal, como en una libreta de reservas; los pendientes, en ocre.
 * El texto de cada estado supera 4,5:1 sobre su fondo.
 */
const RAYADO = 'bg-[repeating-linear-gradient(135deg,rgb(160_87_52/0.18)_0_3px,transparent_3px_7px)]'
export const diaImpreso: Record<DayStatus, { cell: string; dot: string; label: string }> = {
  available: {
    cell: 'bg-white text-forest-900 border-forest-900/25 shadow-soft hover:border-clay-600 hover:bg-cream-50',
    dot: 'bg-white ring-1 ring-forest-900/40',
    label: 'Libre',
  },
  pending: {
    cell: 'bg-gold-500/30 text-forest-900 border-gold-500',
    dot: 'bg-gold-500/60',
    label: 'Pendiente',
  },
  reserved: {
    cell: `${RAYADO} bg-cream-50 text-clay-700 border-clay-600/50 line-through decoration-clay-600/60`,
    dot: `${RAYADO} bg-cream-50 ring-1 ring-clay-600/60`,
    label: 'Reservado',
  },
  blocked: {
    cell: 'bg-forest-900/15 text-forest-900 border-forest-900/20',
    dot: 'bg-forest-900/30',
    label: 'No disponible',
  },
  past: { cell: 'bg-transparent text-forest-900/30 border-transparent', dot: 'bg-transparent', label: 'Pasado' },
}
import type { AvailabilityDay, DayStatus } from '@/types'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export interface MonthCalendarProps {
  month: Date
  onMonthChange: (month: Date) => void
  days: AvailabilityDay[]
  selected?: string | null
  onSelect?: (date: string, status: DayStatus) => void
  /** Solo permite elegir días disponibles (sitio público). */
  onlyAvailable?: boolean
  loading?: boolean
  /** Contenido extra por día (p. ej. nombre del cliente en el admin). */
  renderDayExtra?: (date: string) => React.ReactNode
  /** Estilo del sitio público: colores de la paleta de la portada y días
   *  reservados rayados. El panel conserva sus colores de estado habituales. */
  impreso?: boolean
  className?: string
}

/**
 * Cuadrícula de un mes, semana empezando en lunes.
 * Es el único calendario de la app: el sitio público y el dashboard
 * lo comparten cambiando solo las props.
 */
export function MonthCalendar({
  month,
  onMonthChange,
  days,
  selected,
  onSelect,
  onlyAvailable = false,
  loading,
  renderDayExtra,
  impreso = false,
  className,
}: MonthCalendarProps) {
  const statusByDate = useMemo(() => {
    const map = new Map<string, AvailabilityDay>()
    days.forEach((day) => map.set(day.date, day))
    return map
  }, [days])

  const grid = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [month])

  return (
    <div className={cn('select-none', className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          aria-label="Mes anterior"
          className={cn(
            'p-2 transition-colors',
            impreso
              ? 'rounded-lg border border-forest-900/15 text-forest-900 hover:bg-sand-100'
              : 'rounded-full border border-forest-900/12 text-forest-800 hover:bg-forest-900/5',
          )}
        >
          <ChevronLeft className="size-4" />
        </button>

        <p className={cn('font-display text-lg capitalize', impreso ? 'text-xl font-bold text-forest-900' : 'text-forest-900')}>
          {format(month, 'MMMM yyyy', { locale: es })}
        </p>

        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Mes siguiente"
          className={cn(
            'p-2 transition-colors',
            impreso
              ? 'rounded-lg border border-forest-900/15 text-forest-900 hover:bg-sand-100'
              : 'rounded-full border border-forest-900/12 text-forest-800 hover:bg-forest-900/5',
          )}
        >
          <ChevronRight className="size-4" />
        </button>
      </header>

      <div className="mb-1.5 grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className={cn('py-1 text-center text-[11px] font-semibold uppercase tracking-wider', impreso ? 'font-mono text-forest-900' : 'text-stone-600')}>
            {day}
          </div>
        ))}
      </div>

      <div className={cn('grid grid-cols-7 gap-1 sm:gap-1.5', loading && 'opacity-50')}>
        {grid.map((date) => {
          const key = format(date, 'yyyy-MM-dd')
          const outside = !isSameMonth(date, month)
          const info = statusByDate.get(key)
          const status: DayStatus = info?.status ?? (outside ? 'past' : 'available')
          const styles = impreso ? diaImpreso[status] : dayStatusStyles[status]

          // En el sitio público manda `requestable` (incluye la anticipación
          // mínima); el dashboard puede registrar cualquier día no pasado.
          const selectable =
            !outside &&
            !!onSelect &&
            status !== 'past' &&
            (!onlyAvailable || (info?.requestable ?? false))
          const isSelected = !!selected && isSameDay(date, toDate(selected))

          return (
            <button
              key={key}
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onSelect?.(key, status)}
              aria-label={`${format(date, "d 'de' MMMM", { locale: es })} — ${styles.label}`}
              aria-pressed={isSelected}
              className={cn(
                'relative flex aspect-square flex-col items-center justify-center border text-sm transition-all duration-150',
                impreso ? 'rounded-lg' : 'rounded-xl',
                outside && 'pointer-events-none opacity-0',
                !outside && 'border-forest-900/8',
                !outside && styles.cell,
                selectable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-soft',
                !selectable && !outside && 'cursor-not-allowed',
                // Día libre pero fuera de la ventana de anticipación: se ve apagado.
                onlyAvailable && status === 'available' && !selectable && !outside && 'opacity-40',
                isSelected &&
                  (impreso
                    ? 'border-clay-700! bg-clay-600! text-cream-50! no-underline shadow-soft'
                    : 'border-clay-600! bg-clay-600! text-cream-50! shadow-lift ring-3 ring-clay-600/25'),
              )}
            >
              <span className={cn('font-medium', isToday(date) && !isSelected && 'underline decoration-clay-600 decoration-2 underline-offset-4')}>
                {format(date, 'd')}
              </span>
              {renderDayExtra?.(key)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CalendarLegend({ items, impreso = false }: { items?: DayStatus[]; impreso?: boolean }) {
  const shown = items ?? (['available', 'pending', 'reserved', 'blocked'] as DayStatus[])
  const estilos = impreso ? diaImpreso : dayStatusStyles
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {shown.map((status) => (
        <li key={status} className={cn('flex items-center gap-2 text-sm', impreso ? 'text-forest-900' : 'text-stone-600')}>
          <span className={cn(impreso ? 'size-3.5 rounded' : 'size-2.5 rounded-full', estilos[status].dot)} />
          {estilos[status].label}
        </li>
      ))}
    </ul>
  )
}
