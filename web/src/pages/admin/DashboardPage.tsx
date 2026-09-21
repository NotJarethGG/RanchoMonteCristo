import { Link } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, CalendarClock, CalendarDays, CircleDollarSign, Clock, Wallet,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { StatCard } from '@/components/admin/StatCard'
import { ReservationCard } from '@/components/admin/ReservationCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { PaymentBadge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/ui/States'
import { useDashboard } from '@/hooks/useAdminData'
import { useAuth } from '@/hooks/useAuth'
import { formatDate, formatDateShort, formatMoney, formatMoneyShort, formatTimeRange } from '@/lib/format'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, isError, refetch } = useDashboard()

  const stats = data?.stats
  const maxIncome = Math.max(...(data?.monthly_series.map((m) => m.income) ?? [1]), 1)

  return (
    <>
      <PageHeader
        title={`Hola, ${user?.name.split(' ')[0] ?? ''}`}
        description="Resumen de la operación del rancho este mes."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Reservas del mes"
          value={stats?.reservations_this_month ?? 0}
          hint={`${stats?.occupancy_rate ?? 0}% de ocupación`}
          icon={CalendarDays}
          tone="forest"
          loading={isLoading}
        />
        <StatCard
          label="Pendientes"
          value={stats?.pending ?? 0}
          hint="Solicitudes por revisar"
          icon={Clock}
          tone="warn"
          loading={isLoading}
        />
        <StatCard
          label="Confirmadas"
          value={stats?.confirmed ?? 0}
          hint="Fechas ya apartadas"
          icon={BadgeCheck}
          tone="ok"
          loading={isLoading}
        />
        <StatCard
          label="Ingresos del mes"
          value={formatMoneyShort(stats?.income_this_month ?? 0)}
          hint="Pagos recibidos"
          icon={CircleDollarSign}
          tone="gold"
          loading={isLoading}
        />
        <StatCard
          label="Pagos pendientes"
          value={formatMoneyShort(stats?.pending_balance ?? 0)}
          hint="Saldo por cobrar"
          icon={Wallet}
          tone="danger"
          loading={isLoading}
        />

        {/* Próxima reserva: la respuesta a "¿qué sigue?" */}
        <Card className="bg-forest-900 p-5 text-sage-200 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-sage-400">
              Próxima reserva
            </p>
            <span className="flex size-9 items-center justify-center rounded-xl bg-gold-500/15 text-gold-500">
              <CalendarClock className="size-4.5" strokeWidth={1.5} />
            </span>
          </div>

          {data?.next_reservation ? (
            <Link to={`/admin/reservas/${data.next_reservation.id}`} className="group mt-3 block">
              <p className="font-display text-xl text-cream-50">
                {data.next_reservation.customer?.full_name}
              </p>
              <p className="mt-1 text-sm first-letter:uppercase text-sage-300">
                {formatDate(data.next_reservation.event_date, "EEEE d 'de' MMMM")}
              </p>
              <p className="mt-0.5 text-xs text-sage-400">
                {formatTimeRange(data.next_reservation.start_time, data.next_reservation.end_time)} ·{' '}
                {data.next_reservation.guests} personas
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-gold-500">
                Ver detalle
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ) : (
            <p className="mt-4 text-sm text-sage-400">No hay reservas próximas.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader
            title="Próximas reservas"
            description="Ordenadas por fecha del evento"
            action={
              <Link
                to="/admin/reservas"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-clay-600 transition-colors hover:text-clay-700"
              >
                Ver todas
                <ArrowRight className="size-3.5" />
              </Link>
            }
          />

          {isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : isLoading ? (
            <SkeletonRows rows={5} cols={5} />
          ) : !data?.upcoming.length ? (
            <EmptyState
              icon={<CalendarDays className="size-6" />}
              title="Sin reservas próximas"
              description="Cuando entre una solicitud desde el sitio, aparece acá."
            />
          ) : (
            <>
              {/* Escritorio: tabla */}
              <div className="hidden lg:block">
                <Table>
                  <thead>
                    <tr>
                      <Th>Cliente</Th>
                      <Th>Fecha</Th>
                      <Th>Personas</Th>
                      <Th>Estado</Th>
                      <Th>Pago</Th>
                      <Th className="text-right">Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcoming.map((reservation) => (
                      <Tr key={reservation.id}>
                        <Td>
                          <p className="font-medium">{reservation.customer?.full_name}</p>
                          <p className="font-mono text-xs text-stone-600">{reservation.code}</p>
                        </Td>
                        <Td className="whitespace-nowrap">
                          {formatDateShort(reservation.event_date)}
                          <p className="text-xs text-stone-600">
                            {formatTimeRange(reservation.start_time, reservation.end_time)}
                          </p>
                        </Td>
                        <Td className="tabular-nums">{reservation.guests}</Td>
                        <Td>
                          <StatusBadge status={reservation.status} label={reservation.status_label} />
                        </Td>
                        <Td>
                          <PaymentBadge
                            status={reservation.totals.payment_status}
                            label={reservation.totals.payment_status_label}
                          />
                          <p className="mt-1 text-xs text-stone-600 tabular-nums">
                            {formatMoney(reservation.totals.paid)} / {formatMoney(reservation.totals.total)}
                          </p>
                        </Td>
                        <Td className="text-right">
                          <Link
                            to={`/admin/reservas/${reservation.id}`}
                            className="inline-flex items-center gap-1 rounded-full border border-forest-900/12 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-forest-900/5"
                          >
                            Abrir
                          </Link>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Móvil: tarjetas */}
              <div className="space-y-3 p-4 lg:hidden">
                {data.upcoming.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader title="Últimos 6 meses" description="Ingresos recibidos por mes" />
          <div className="space-y-4 px-5 py-5 sm:px-6">
            {(data?.monthly_series ?? []).map((month) => (
              <div key={month.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium capitalize text-forest-800">{month.month}</span>
                  <span className="text-sm text-stone-600 tabular-nums">
                    {formatMoneyShort(month.income)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-sand-200">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-moss-600 to-forest-700 transition-all duration-700"
                    style={{ width: `${Math.max((month.income / maxIncome) * 100, 2)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-stone-600">
                  {month.reservations} {month.reservations === 1 ? 'reserva' : 'reservas'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
