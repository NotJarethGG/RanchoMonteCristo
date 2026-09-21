import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Mail, MessageCircle, Phone } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { ReservationCard } from '@/components/admin/ReservationCard'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { PaymentBadge, StatusBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States'
import { useCustomer } from '@/hooks/useAdminData'
import { formatDateShort, formatMoney, initials, whatsappLink } from '@/lib/format'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const { data: customer, isLoading, isError, refetch } = useCustomer(Number(id))

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (isError || !customer) return <ErrorState onRetry={() => refetch()} />

  const reservations = customer.reservations ?? []
  const totalSpent = reservations
    .filter((reservation) => reservation.status !== 'cancelled')
    .reduce((sum, reservation) => sum + reservation.totals.paid, 0)

  return (
    <>
      <Link
        to="/admin/clientes"
        className="mb-4 inline-flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-clay-600"
      >
        <ArrowLeft className="size-4" />
        Volver a clientes
      </Link>

      <PageHeader title={customer.full_name} description={`Cliente desde ${formatDateShort(customer.created_at)}`} />

      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-5">
          <Card>
            <CardBody className="text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-sage-100 font-display text-xl text-forest-700">
                {initials(customer.full_name)}
              </span>
              <h2 className="mt-4 font-display text-xl text-forest-900">{customer.full_name}</h2>

              <div className="mt-5 space-y-3 text-left">
                <a href={`tel:${customer.phone}`} className="flex items-center gap-2.5 text-sm text-stone-700 transition-colors hover:text-clay-600">
                  <Phone className="size-4 shrink-0 text-stone-600/60" />
                  {customer.phone}
                </a>
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-2.5 break-all text-sm text-stone-700 transition-colors hover:text-clay-600">
                    <Mail className="size-4 shrink-0 text-stone-600/60" />
                    {customer.email}
                  </a>
                )}
              </div>

              <a
                href={whatsappLink(customer.phone, `Hola ${customer.full_name}, le escribimos del Rancho Monte Cristo.`)}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ok-600 px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
              >
                <MessageCircle className="size-4" />
                Escribir por WhatsApp
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <dl className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-stone-600">Reservas</dt>
                  <dd className="mt-1 font-display text-2xl text-forest-900 tabular-nums">
                    {customer.reservations_count ?? reservations.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-stone-600">Total pagado</dt>
                  <dd className="mt-1 font-display text-2xl text-forest-900 tabular-nums">
                    {formatMoney(totalSpent)}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          {customer.notes && (
            <Card>
              <CardHeader title="Notas" />
              <CardBody>
                <p className="text-sm leading-relaxed text-stone-700">{customer.notes}</p>
              </CardBody>
            </Card>
          )}
        </div>

        <Card className="overflow-hidden">
          <CardHeader title="Historial de reservas" description={`${reservations.length} registro(s)`} />

          {!reservations.length ? (
            <EmptyState
              icon={<CalendarDays className="size-6" />}
              title="Sin reservas"
              description="Este cliente todavía no tiene reservas registradas."
            />
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <thead>
                    <tr>
                      <Th>Código</Th>
                      <Th>Fecha</Th>
                      <Th>Evento</Th>
                      <Th className="text-center">Personas</Th>
                      <Th>Estado</Th>
                      <Th className="text-right">Total</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => (
                      <Tr key={reservation.id}>
                        <Td className="font-mono text-xs text-stone-600">{reservation.code}</Td>
                        <Td className="whitespace-nowrap">{formatDateShort(reservation.event_date)}</Td>
                        <Td className="text-stone-700">{reservation.event_type ?? '—'}</Td>
                        <Td className="text-center tabular-nums">{reservation.guests}</Td>
                        <Td>
                          <div className="flex flex-col items-start gap-1.5">
                            <StatusBadge status={reservation.status} label={reservation.status_label} />
                            <PaymentBadge
                              status={reservation.totals.payment_status}
                              label={reservation.totals.payment_status_label}
                            />
                          </div>
                        </Td>
                        <Td className="text-right tabular-nums">{formatMoney(reservation.totals.total)}</Td>
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
                {reservations.map((reservation) => (
                  <ReservationCard key={reservation.id} reservation={reservation} />
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  )
}
