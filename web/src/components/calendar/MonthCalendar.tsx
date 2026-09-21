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
          className="rounded-full border border-forest-900/12 p-2 text-forest-800 transition-colors hover:bg-forest-900/5"
        >
          <ChevronLeft className="size-4" />
        </button>

        <p className="font-display text-lg capitalize text-forest-900">
          {format(month, 'MMMM yyyy', { locale: es })}
        </p>

        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          aria-label="Mes siguiente"
          className="rounded-full border border-forest-900/12 p-2 text-forest-800 transition-colors hover:bg-forest-900/5"
        >
          <ChevronRight className="size-4" />
        </button>
      </header>

      <div className="mb-1.5 grid grid-cols-7 gap-1 sm:gap-1.5">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-stone-600">
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
          const styles = dayStatusStyles[status]

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
                'relative flex aspect-square flex-col items-center justify-center rounded-xl border text-sm transition-all duration-150',
                outside && 'pointer-events-none opacity-0',
                !outside && 'border-forest-900/8',
                !outside && styles.cell,
                selectable && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-soft',
                !selectable && !outside && 'cursor-not-allowed',
                // Día libre pero fuera de la ventana de anticipación: se ve apagado.
                onlyAvailable && status === 'available' && !selectable && !outside && 'opacity-40',
                isSelected && 'border-clay-600! bg-clay-600! text-cream-50! shadow-lift ring-3 ring-clay-600/25',
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

export function CalendarLegend({ items }: { items?: DayStatus[] }) {
  const shown = items ?? (['available', 'pending', 'reserved', 'blocked'] as DayStatus[])
  return (
    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {shown.map((status) => (
        <li key={status} className="flex items-center gap-2 text-sm text-stone-600">
          <span className={cn('size-2.5 rounded-full', dayStatusStyles[status].dot)} />
          {dayStatusStyles[status].label}
        </li>
      ))}
    </ul>
  )
}
