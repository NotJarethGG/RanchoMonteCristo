import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Search, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { PaymentModal } from '@/components/admin/PaymentModal'
import { StatCard } from '@/components/admin/StatCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Field'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { PaymentBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { usePayments } from '@/hooks/useAdminData'
import { useDebounced } from '@/hooks/useDebounced'
import { formatDateShort, formatMoney, formatMoneyShort } from '@/lib/format'
import type { Reservation } from '@/types'

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [target, setTarget] = useState<Reservation | null>(null)

  const debounced = useDebounced(search, 350)
  const { data, isLoading, isError, refetch } = usePayments({
    search: debounced || undefined,
    status: status || undefined,
    page,
  })

  return (
    <>
      <PageHeader title="Pagos" description="Control de adelantos y saldos por reserva." />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Facturado"
          value={formatMoneyShort(data?.summary.total ?? 0)}
          hint="Reservas vigentes de esta página"
          icon={CreditCard}
          tone="forest"
          loading={isLoading}
        />
        <StatCard
          label="Cobrado"
          value={formatMoneyShort(data?.summary.paid ?? 0)}
          icon={Wallet}
          tone="ok"
          loading={isLoading}
        />
        <StatCard
          label="Por cobrar"
          value={formatMoneyShort(data?.summary.balance ?? 0)}
          icon={Wallet}
          tone="danger"
          loading={isLoading}
        />
      </div>

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-600/60" />
            <Input
              placeholder="Buscar por cliente o código de reserva…"
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
            <option value="">Todos los pagos</option>
            <option value="pending">Pendientes</option>
            <option value="partial">Parciales</option>
            <option value="paid">Pagados</option>
          </Select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonRows rows={8} cols={6} />
        ) : !data?.data.length ? (
          <EmptyState
            icon={<CreditCard className="size-6" />}
            title="Sin movimientos"
            description="Las reservas confirmadas y finalizadas aparecen acá con su estado de pago."
          />
        ) : (
          <>
            <div className="hidden lg:block">
              <Table>
                <thead>
                  <tr>
                    <Th>Reserva</Th>
                    <Th>Cliente</Th>
                    <Th>Fecha del evento</Th>
                    <Th className="text-right">Total</Th>
                    <Th className="text-right">Adelanto</Th>
                    <Th className="text-right">Saldo</Th>
                    <Th>Estado</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((reservation) => (
                    <Tr key={reservation.id}>
                      <Td>
                        <Link to={`/admin/reservas/${reservation.id}`} className="font-mono text-xs text-clay-600 hover:underline">
                          {reservation.code}
                        </Link>
                      </Td>
                      <Td className="font-medium">{reservation.customer?.full_name}</Td>
                      <Td className="whitespace-nowrap text-stone-700">
                        {formatDateShort(reservation.event_date)}
                      </Td>
                      <Td className="text-right tabular-nums">{formatMoney(reservation.totals.total)}</Td>
                      <Td className="text-right tabular-nums text-ok-600">
                        {formatMoney(reservation.totals.paid)}
                      </Td>
                      <Td className="text-right tabular-nums text-danger-600">
                        {formatMoney(reservation.totals.balance)}
                      </Td>
                      <Td>
                        <PaymentBadge
                          status={reservation.totals.payment_status}
                          label={reservation.totals.payment_status_label}
                        />
                      </Td>
                      <Td className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={reservation.totals.balance <= 0}
                          onClick={() => setTarget(reservation)}
                        >
                          Registrar
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <ul className="divide-y divide-forest-900/6 lg:hidden">
              {data.data.map((reservation) => (
                <li key={reservation.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-forest-900">
                        {reservation.customer?.full_name}
                      </p>
                      <p className="font-mono text-xs text-stone-600">{reservation.code}</p>
                    </div>
                    <PaymentBadge
                      status={reservation.totals.payment_status}
                      label={reservation.totals.payment_status_label}
                    />
                  </div>

                  <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-sand-100 p-3 text-center text-xs">
                    {[
                      { label: 'Total', value: reservation.totals.total },
                      { label: 'Pagado', value: reservation.totals.paid },
                      { label: 'Saldo', value: reservation.totals.balance },
                    ].map((item) => (
                      <div key={item.label}>
                        <dt className="text-stone-600">{item.label}</dt>
                        <dd className="mt-0.5 font-semibold text-forest-900 tabular-nums">
                          {formatMoney(item.value)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    disabled={reservation.totals.balance <= 0}
                    onClick={() => setTarget(reservation)}
                  >
                    Registrar pago
                  </Button>
                </li>
              ))}
            </ul>

            <Pagination
              page={data.meta.current_page}
              lastPage={data.meta.last_page}
              total={data.meta.total}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <PaymentModal reservation={target} open={!!target} onClose={() => setTarget(null)} />
    </>
  )
}
