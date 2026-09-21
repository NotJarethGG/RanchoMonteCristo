import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Ban, CalendarPlus, Lock, Plus, Trash2, Users } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { ReservationFormModal } from '@/components/admin/ReservationFormModal'
import { CalendarLegend, MonthCalendar } from '@/components/calendar/MonthCalendar'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import { EmptyState, Spinner } from '@/components/ui/States'
import { useBlockDate, useCalendarMonth, useUnblockDate } from '@/hooks/useAdminData'
import { formatDate, formatMoney, formatTimeRange } from '@/lib/format'
import type { BlockedDate } from '@/types'

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date())
  const [selected, setSelected] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [blockOpen, setBlockOpen] = useState(false)
  const [toUnblock, setToUnblock] = useState<BlockedDate | null>(null)

  const monthKey = format(month, 'yyyy-MM')
  const { data, isLoading, isFetching } = useCalendarMonth(monthKey)
  const block = useBlockDate()
  const unblock = useUnblockDate()

  const [range, setRange] = useState({ start_date: '', end_date: '', reason: '' })

  const byDate = useMemo(() => {
    const map = new Map<string, typeof data extends undefined ? never : NonNullable<typeof data>['reservations']>()
    data?.reservations.forEach((reservation) => {
      const list = map.get(reservation.event_date) ?? []
      map.set(reservation.event_date, [...list, reservation])
    })
    return map
  }, [data])

  const dayReservations = selected ? byDate.get(selected) ?? [] : []

  return (
    <>
      <PageHeader
        title="Calendario"
        description="Vista mensual de reservas y fechas bloqueadas."
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Lock className="size-4" />}
              onClick={() => {
                setRange({ start_date: selected ?? '', end_date: selected ?? '', reason: '' })
                setBlockOpen(true)
              }}
            >
              Bloquear fecha
            </Button>
            <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setFormOpen(true)}>
              Nueva reserva
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-5 sm:p-7">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : (
            <MonthCalendar
              month={month}
              onMonthChange={setMonth}
              days={data?.days ?? []}
              selected={selected}
              onSelect={(date) => setSelected(date)}
              loading={isFetching && !isLoading}
              renderDayExtra={(date) => {
                const count = byDate.get(date)?.length ?? 0
                return count > 0 ? (
                  <span className="mt-0.5 text-[10px] font-medium opacity-70">
                    {count} {count === 1 ? 'evento' : 'eventos'}
                  </span>
                ) : null
              }}
            />
          )}

          <div className="mt-7 border-t border-forest-900/8 pt-5">
            <CalendarLegend items={['available', 'pending', 'reserved', 'blocked']} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title={selected ? formatDate(selected) : 'Elegí un día'}
              description={selected ? `${dayReservations.length} evento(s) ese día` : undefined}
              action={
                selected && (
                  <Button size="sm" variant="outline" icon={<CalendarPlus className="size-4" />} onClick={() => setFormOpen(true)}>
                    Agregar
                  </Button>
                )
              }
            />

            {!selected ? (
              <EmptyState
                title="Sin día seleccionado"
                description="Tocá una fecha del calendario para ver o crear reservas."
              />
            ) : dayReservations.length === 0 ? (
              <EmptyState
                title="Día libre"
                description="No hay eventos registrados para esta fecha."
                action={
                  <Button size="sm" onClick={() => setFormOpen(true)}>
                    Crear reserva
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-forest-900/6">
                {dayReservations.map((reservation) => (
                  <li key={reservation.id}>
                    <Link
                      to={`/admin/reservas/${reservation.id}`}
                      className="block px-5 py-4 transition-colors hover:bg-sand-100/60 sm:px-6"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-forest-900">
                            {reservation.customer?.full_name}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-600">
                            {formatTimeRange(reservation.start_time, reservation.end_time)}
                          </p>
                        </div>
                        <StatusBadge status={reservation.status} label={reservation.status_label} />
                      </div>
                      <div className="mt-2.5 flex items-center gap-4 text-xs text-stone-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="size-3.5" />
                          {reservation.guests}
                        </span>
                        <span className="tabular-nums">{formatMoney(reservation.totals.total)}</span>
                        {reservation.customer?.phone && <span>{reservation.customer.phone}</span>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Fechas bloqueadas" description="Días no disponibles para alquiler" />
            {!data?.blocked_dates.length ? (
              <EmptyState
                icon={<Ban className="size-6" />}
                title="Sin bloqueos"
                description="Bloqueá fechas por mantenimiento o uso propio."
              />
            ) : (
              <ul className="divide-y divide-forest-900/6">
                {data.blocked_dates.map((blocked) => (
                  <li key={blocked.id} className="flex items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-forest-900">
                        {blocked.start_date === blocked.end_date
                          ? formatDate(blocked.start_date)
                          : `${formatDate(blocked.start_date, 'd MMM')} – ${formatDate(blocked.end_date, 'd MMM yyyy')}`}
                      </p>
                      {blocked.reason && <p className="truncate text-xs text-stone-600">{blocked.reason}</p>}
                    </div>
                    <button
                      onClick={() => setToUnblock(blocked)}
                      aria-label="Eliminar bloqueo"
                      className="rounded-lg p-2 text-stone-600 transition-colors hover:bg-danger-100 hover:text-danger-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <ReservationFormModal open={formOpen} onClose={() => setFormOpen(false)} defaultDate={selected ?? undefined} />

      <Modal
        open={blockOpen}
        onClose={() => setBlockOpen(false)}
        title="Bloquear fechas"
        description="Los días bloqueados no se pueden solicitar desde el sitio."
        footer={
          <>
            <Button variant="ghost" onClick={() => setBlockOpen(false)}>
              Cancelar
            </Button>
            <Button
              loading={block.isPending}
              disabled={!range.start_date || !range.end_date}
              onClick={async () => {
                await block.mutateAsync(range)
                setBlockOpen(false)
              }}
            >
              Bloquear
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Desde" required htmlFor="bd_start">
              <Input
                id="bd_start"
                type="date"
                value={range.start_date}
                onChange={(e) => setRange((r) => ({ ...r, start_date: e.target.value, end_date: r.end_date || e.target.value }))}
              />
            </Field>
            <Field label="Hasta" required htmlFor="bd_end">
              <Input
                id="bd_end"
                type="date"
                value={range.end_date}
                onChange={(e) => setRange((r) => ({ ...r, end_date: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Motivo" hint="Solo visible para el equipo." htmlFor="bd_reason">
            <Input
              id="bd_reason"
              value={range.reason}
              onChange={(e) => setRange((r) => ({ ...r, reason: e.target.value }))}
              placeholder="Mantenimiento del rancho"
            />
          </Field>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toUnblock}
        onClose={() => setToUnblock(null)}
        onConfirm={async () => {
          if (toUnblock) await unblock.mutateAsync(toUnblock.id)
          setToUnblock(null)
        }}
        loading={unblock.isPending}
        title="Eliminar bloqueo"
        message="Las fechas volverán a estar disponibles para solicitudes del público."
        confirmLabel="Eliminar"
      />
    </>
  )
}
