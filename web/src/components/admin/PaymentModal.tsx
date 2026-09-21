import { useState } from 'react'
import { format } from 'date-fns'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useCreatePayment } from '@/hooks/useAdminData'
import { formatMoney } from '@/lib/format'
import type { Reservation } from '@/types'

const METHODS = [
  { value: 'sinpe', label: 'SINPE Móvil' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'other', label: 'Otro' },
]

export function PaymentModal({
  reservation,
  open,
  onClose,
}: {
  reservation: Reservation | null
  open: boolean
  onClose: () => void
}) {
  const mutation = useCreatePayment()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('sinpe')
  const [paidAt, setPaidAt] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')

  if (!reservation) return null

  const submit = async () => {
    await mutation.mutateAsync({
      reservation_id: reservation.id,
      amount: Number(amount),
      method,
      paid_at: paidAt,
      reference: reference || undefined,
      notes: notes || undefined,
    })
    setAmount('')
    setReference('')
    setNotes('')
    onClose()
  }

  const suggestions = [
    { label: 'Adelanto', value: reservation.totals.deposit },
    { label: 'Saldo completo', value: reservation.totals.balance },
  ].filter((item) => item.value > 0)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar pago"
      description={`${reservation.code} · ${reservation.customer?.full_name ?? ''}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={mutation.isPending} disabled={!amount || Number(amount) <= 0}>
            Registrar pago
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-sand-100 p-4 text-center">
          {[
            { label: 'Total', value: reservation.totals.total },
            { label: 'Pagado', value: reservation.totals.paid },
            { label: 'Saldo', value: reservation.totals.balance },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] uppercase tracking-wider text-stone-600">{item.label}</p>
              <p className="mt-1 text-sm font-semibold text-forest-900 tabular-nums">
                {formatMoney(item.value)}
              </p>
            </div>
          ))}
        </div>

        <Field label="Monto" required htmlFor="amount">
          <Input
            id="amount"
            type="number"
            min={0}
            step={500}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
          />
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setAmount(String(item.value))}
                  className="rounded-full border border-forest-900/12 px-3 py-1 text-xs text-forest-800 transition-colors hover:bg-forest-900/5"
                >
                  {item.label}: {formatMoney(item.value)}
                </button>
              ))}
            </div>
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Método" required htmlFor="method">
            <Select id="method" value={method} onChange={(event) => setMethod(event.target.value)}>
              {METHODS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Fecha del pago" required htmlFor="paid_at">
            <Input id="paid_at" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} />
          </Field>
        </div>

        <Field label="Referencia" hint="Número de comprobante o transacción." htmlFor="reference">
          <Input
            id="reference"
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="SINPE-04821"
          />
        </Field>

        <Field label="Notas" htmlFor="payment_notes">
          <Textarea
            id="payment_notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-20"
          />
        </Field>
      </div>
    </Modal>
  )
}
