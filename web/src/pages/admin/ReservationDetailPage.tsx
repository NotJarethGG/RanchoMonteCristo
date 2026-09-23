import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, BadgeCheck, CalendarDays, CheckCheck, Clock, CreditCard, Mail, MessageCircle,
  Pencil, Phone, Receipt, Users, XCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { PaymentModal } from '@/components/admin/PaymentModal'
import { ReservationFormModal } from '@/components/admin/ReservationFormModal'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PaymentBadge, StatusBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Field, Textarea } from '@/components/ui/Field'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/States'
import {
  useCancelReservation, useCompleteReservation, useConfirmReservation, useReservation,
} from '@/hooks/useAdminData'
import {
  formatDate, formatDateShort, formatMoney, formatTimeRange, telLink, whatsappLink,
} from '@/lib/format'

export default function ReservationDetailPage() {
  const { id } = useParams()
  const reservationId = Number(id)
  const { data: reservation, isLoading, isError, refetch } = useReservation(reservationId)

  const [payOpen, setPayOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason] = useState('')

  const confirm = useConfirmReservation()
  const cancel = useCancelReservation()
  const complete = useCompleteReservation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (isError || !reservation) return <ErrorState onRetry={() => refetch()} />

  const { customer, totals } = reservation

  return (
    <>
      <Link
        to="/admin/reservas"
        className="mb-4 inline-flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-clay-600"
      >
        <ArrowLeft className="size-4" />
        Volver a reservas
      </Link>

      <PageHeader
        title={reservation.code}
        description={`Solicitada ${formatDateShort(reservation.created_at)} · origen ${reservation.source}`}
        action={
          <div className="flex flex-wrap gap-2">
            {reservation.status !== 'confirmed' && reservation.status !== 'cancelled' && (
              <Button
                size="sm"
                icon={<BadgeCheck className="size-4" />}
                loading={confirm.isPending}
                onClick={() => confirm.mutate(reservation.id)}
              >
                Confirmar
              </Button>
            )}
            {reservation.status === 'confirmed' && (
              <Button
                size="sm"
                variant="secondary"
                icon={<CheckCheck className="size-4" />}
                loading={complete.isPending}
                onClick={() => complete.mutate(reservation.id)}
              >
                Marcar finalizada
              </Button>
            )}
            <Button size="sm" variant="outline" icon={<Pencil className="size-4" />} onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<CreditCard className="size-4" />}
              onClick={() => setPayOpen(true)}
              disabled={totals.balance <= 0}
            >
              Registrar pago
            </Button>
            {reservation.status !== 'cancelled' && (
              <Button size="sm" variant="ghost" icon={<XCircle className="size-4" />} onClick={() => setCancelOpen(true)}>
                Cancelar
              </Button>
            )}
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <StatusBadge status={reservation.status} label={reservation.status_label} />
        <PaymentBadge status={totals.payment_status} label={totals.payment_status_label} />
        {reservation.cancellation_reason && (
          <span className="text-sm text-danger-600">Motivo: {reservation.cancellation_reason}</span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Información del evento" />
            <CardBody>
              <dl className="grid gap-5 sm:grid-cols-2">
                {[
                  { icon: CalendarDays, label: 'Fecha', value: formatDate(reservation.event_date) },
                  { icon: Clock, label: 'Horario', value: formatTimeRange(reservation.start_time, reservation.end_time) },
                  { icon: Users, label: 'Cantidad de personas', value: `${reservation.guests} personas` },
                  { icon: Receipt, label: 'Tipo de evento', value: reservation.event_type ?? '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-3">
                    <Icon className="mt-0.5 size-4.5 shrink-0 text-clay-600" strokeWidth={1.5} />
                    <div>
                      <dt className="text-xs uppercase tracking-wider text-stone-600">{label}</dt>
                      <dd className="mt-0.5 font-medium text-forest-900">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              {reservation.notes && (
                <div className="mt-6 rounded-xl bg-sand-100 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    Comentarios del cliente
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-forest-900">{reservation.notes}</p>
                </div>
              )}

              {reservation.internal_notes && (
                <div className="mt-3 rounded-xl border border-warn-600/20 bg-warn-100/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-warn-600">
                    Notas internas
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-forest-900">
                    {reservation.internal_notes}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Pagos"
              description={`${reservation.payments?.length ?? 0} movimiento(s) registrados`}
              action={
                <Button size="sm" variant="outline" onClick={() => setPayOpen(true)} disabled={totals.balance <= 0}>
                  Agregar
                </Button>
              }
            />
            {!reservation.payments?.length ? (
              <EmptyState
                icon={<CreditCard className="size-6" />}
                title="Sin pagos registrados"
                description="Registrá el adelanto cuando el cliente lo envíe."
              />
            ) : (
              <ul className="divide-y divide-forest-900/6">
                {reservation.payments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                      <p className="font-medium text-forest-900 tabular-nums">
                        {formatMoney(payment.amount)}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-600">
                        {payment.method_label} · {formatDateShort(payment.paid_at)}
                        {payment.reference && ` · ${payment.reference}`}
                      </p>
                    </div>
                    {payment.recorded_by && (
                      <p className="shrink-0 text-xs text-stone-600">por {payment.recorded_by}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Cliente" />
            <CardBody className="space-y-3.5">
              <p className="font-display text-xl text-forest-900">{customer?.full_name}</p>

              {customer?.phone && (
                <a href={telLink(customer.phone)} className="flex items-center gap-2.5 text-sm text-stone-700 transition-colors hover:text-clay-600">
                  <Phone className="size-4 shrink-0 text-stone-600/60" />
                  {customer.phone}
                </a>
              )}
              {customer?.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-2.5 break-all text-sm text-stone-700 transition-colors hover:text-clay-600">
                  <Mail className="size-4 shrink-0 text-stone-600/60" />
                  {customer.email}
                </a>
              )}

              <div className="flex gap-2 pt-2">
                {customer?.phone && (
                  <a
                    href={whatsappLink(customer.phone, `Hola ${customer.full_name}, le escribimos del Rancho Montecristo sobre su reserva ${reservation.code}.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-ok-600 px-4 py-2 text-xs font-medium text-white transition hover:brightness-110"
                  >
                    <MessageCircle className="size-3.5" />
                    WhatsApp
                  </a>
                )}
                {customer && (
                  <Link
                    to={`/admin/clientes/${customer.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-forest-900/12 px-4 py-2 text-xs font-medium transition-colors hover:bg-forest-900/5"
                  >
                    Ver historial
                  </Link>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Resumen financiero" />
            <CardBody>
              {reservation.pricing_breakdown.length > 0 && (
                <ul className="mb-4 space-y-2 border-b border-forest-900/8 pb-4 text-sm">
                  {reservation.pricing_breakdown.map((line) => (
                    <li key={line.rule_id} className="flex justify-between gap-3 text-stone-600">
                      <span className="min-w-0 truncate">{line.name}</span>
                      <span className="shrink-0 tabular-nums">{formatMoney(line.computed)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <dl className="space-y-3 text-sm">
                {[
                  { label: 'Precio total', value: totals.total, className: 'text-forest-900 font-semibold' },
                  { label: 'Adelanto requerido', value: totals.deposit, className: 'text-stone-700' },
                  { label: 'Pagado', value: totals.paid, className: 'text-ok-600' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between gap-3">
                    <dt className="text-stone-600">{item.label}</dt>
                    <dd className={`tabular-nums ${item.className}`}>{formatMoney(item.value)}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex items-baseline justify-between border-t border-forest-900/8 pt-4">
                <span className="text-sm font-medium text-forest-800">Saldo pendiente</span>
                <span className="font-display text-2xl text-clay-600 tabular-nums">
                  {formatMoney(totals.balance)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <PaymentModal reservation={reservation} open={payOpen} onClose={() => setPayOpen(false)} />
      <ReservationFormModal open={editOpen} onClose={() => setEditOpen(false)} reservation={reservation} />

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancelar reserva"
        description="La fecha vuelve a quedar disponible en el calendario."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
            <Button
              variant="danger"
              loading={cancel.isPending}
              onClick={async () => {
                await cancel.mutateAsync({ id: reservation.id, reason: reason || undefined })
                setCancelOpen(false)
                setReason('')
              }}
            >
              Cancelar reserva
            </Button>
          </>
        }
      >
        <Field label="Motivo" hint="Queda registrado en el historial." htmlFor="cancel_reason">
          <Textarea
            id="cancel_reason"
            className="min-h-24"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="El cliente reprogramó para otra fecha."
          />
        </Field>
      </Modal>
    </>
  )
}
