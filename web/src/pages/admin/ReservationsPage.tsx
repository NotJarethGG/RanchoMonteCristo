import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { ReservationCard } from '@/components/admin/ReservationCard'
import { ReservationFormModal } from '@/components/admin/ReservationFormModal'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { LocaleBadge, PaymentBadge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { useReservations } from '@/hooks/useAdminData'
import { useDebounced } from '@/hooks/useDebounced'
import { formatDateShort, formatMoney, formatTimeRange } from '@/lib/format'

const STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'completed', label: 'Finalizadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

export default function ReservationsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [formOpen, setFormOpen] = useState(false)

  const debouncedSearch = useDebounced(search, 350)

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: status || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
    }),
    [debouncedSearch, status, from, to, page],
  )

  const { data, isLoading, isError, refetch, isPlaceholderData } = useReservations(filters)
  const hasFilters = !!(search || status || from || to)

  const reset = () => {
    setSearch('')
    setStatus('')
    setFrom('')
    setTo('')
    setPage(1)
  }

  return (
    <>
      <PageHeader
        title="Reservas"
        description="Todas las solicitudes y reservas del rancho."
        action={
          <Button icon={<Plus className="size-4" />} onClick={() => setFormOpen(true)}>
            Nueva reserva
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-600/60" />
            <Input
              placeholder="Buscar por cliente, código o tipo de evento…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            className="w-full sm:w-52"
          >
            {STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>

          <Button
            variant="outline"
            icon={<SlidersHorizontal className="size-4" />}
            onClick={() => setShowFilters((value) => !value)}
          >
            Fechas
          </Button>

          {hasFilters && (
            <Button variant="ghost" icon={<X className="size-4" />} onClick={reset}>
              Limpiar
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 grid animate-fade-in gap-3 border-t border-forest-900/8 pt-4 sm:grid-cols-2 lg:max-w-md">
            <label className="text-xs font-medium text-stone-600">
              Desde
              <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1) }} className="mt-1" />
            </label>
            <label className="text-xs font-medium text-stone-600">
              Hasta
              <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1) }} className="mt-1" />
            </label>
          </div>
        )}
      </Card>

      <Card className={`overflow-hidden ${isPlaceholderData ? 'opacity-60' : ''}`}>
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonRows rows={8} cols={6} />
        ) : !data?.data.length ? (
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title={hasFilters ? 'Sin resultados' : 'Todavía no hay reservas'}
            description={
              hasFilters
                ? 'Probá cambiando los filtros de búsqueda.'
                : 'Las solicitudes del sitio web aparecen acá automáticamente.'
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={reset}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button onClick={() => setFormOpen(true)}>Crear la primera</Button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden lg:block">
              <Table>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Cliente</Th>
                    <Th>Fecha y hora</Th>
                    <Th>Personas</Th>
                    <Th>Evento</Th>
                    <Th>Estado</Th>
                    <Th className="text-right">Total</Th>
                    <Th className="text-right">Pagado</Th>
                    <Th className="text-right">Pendiente</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((reservation) => (
                    <Tr key={reservation.id}>
                      <Td className="font-mono text-xs text-stone-600">{reservation.code}</Td>
                      <Td>
                        <p className="font-medium">{reservation.customer?.full_name}</p>
                        <p className="text-xs text-stone-600">{reservation.customer?.phone}</p>
                      </Td>
                      <Td className="whitespace-nowrap">
                        {formatDateShort(reservation.event_date)}
                        <p className="text-xs text-stone-600">
                          {formatTimeRange(reservation.start_time, reservation.end_time)}
                        </p>
                      </Td>
                      <Td className="tabular-nums">{reservation.guests}</Td>
                      <Td className="text-stone-700">{reservation.event_type ?? '—'}</Td>
                      <Td>
                        <div className="flex flex-col items-start gap-1.5">
                          <StatusBadge status={reservation.status} label={reservation.status_label} />
                          <PaymentBadge
                            status={reservation.totals.payment_status}
                            label={reservation.totals.payment_status_label}
                          />
                          <LocaleBadge locale={reservation.locale} />
                        </div>
                      </Td>
                      <Td className="text-right tabular-nums">{formatMoney(reservation.totals.total)}</Td>
                      <Td className="text-right tabular-nums text-ok-600">
                        {formatMoney(reservation.totals.paid)}
                      </Td>
                      <Td className="text-right tabular-nums text-danger-600">
                        {formatMoney(reservation.totals.balance)}
                      </Td>
                      <Td className="text-right">
                        <Link
                          to={`/admin/reservas/${reservation.id}`}
                          className="inline-flex rounded-full border border-forest-900/12 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-forest-900/5"
                        >
                          Abrir
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div className="space-y-3 p-4 lg:hidden">
              {data.data.map((reservation) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>

            <Pagination
              page={data.meta.current_page}
              lastPage={data.meta.last_page}
              total={data.meta.total}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <ReservationFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  )
}
