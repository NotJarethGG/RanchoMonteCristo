import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useCreateReservation, useUpdateReservation } from '@/hooks/useAdminData'
import type { Reservation } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  /** Si viene una reserva se edita; si no, se crea una nueva. */
  reservation?: Reservation | null
  defaultDate?: string
}

const EMPTY = {
  full_name: '',
  phone: '',
  email: '',
  event_date: '',
  start_time: '09:00',
  end_time: '18:00',
  guests: 40,
  event_type: '',
  notes: '',
  internal_notes: '',
  status: 'confirmed',
}

export function ReservationFormModal({ open, onClose, reservation, defaultDate }: Props) {
  const editing = !!reservation
  const [form, setForm] = useState({ ...EMPTY })

  const create = useCreateReservation()
  const update = useUpdateReservation(reservation?.id ?? 0)
  const pending = create.isPending || update.isPending

  useEffect(() => {
    if (!open) return
    setForm(
      reservation
        ? {
            full_name: reservation.customer?.full_name ?? '',
            phone: reservation.customer?.phone ?? '',
            email: reservation.customer?.email ?? '',
            event_date: reservation.event_date,
            start_time: reservation.start_time,
            end_time: reservation.end_time,
            guests: reservation.guests,
            event_type: reservation.event_type ?? '',
            notes: reservation.notes ?? '',
            internal_notes: reservation.internal_notes ?? '',
            status: reservation.status,
          }
        : { ...EMPTY, event_date: defaultDate ?? format(new Date(), 'yyyy-MM-dd') },
    )
  }, [open, reservation, defaultDate])

  const set = (key: keyof typeof EMPTY, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async () => {
    const payload = { ...form, guests: Number(form.guests), source: 'manual' }
    if (editing) {
      // Al editar no se tocan los datos del cliente desde esta pantalla.
      const { full_name: _n, phone: _p, email: _e, ...rest } = payload
      await update.mutateAsync(rest)
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={editing ? `Editar ${reservation?.code}` : 'Nueva reserva'}
      description={
        editing
          ? 'Ajustá los datos del evento.'
          : 'Registro manual: el cliente se crea o se reutiliza por teléfono.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} loading={pending}>
            {editing ? 'Guardar cambios' : 'Crear reserva'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {!editing && (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre del cliente" required htmlFor="rf_name">
              <Input id="rf_name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
            </Field>
            <Field label="Teléfono" required htmlFor="rf_phone" hint="Si ya existe, se reutiliza el cliente.">
              <Input id="rf_phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
            <Field label="Correo" htmlFor="rf_email" className="sm:col-span-2">
              <Input id="rf_email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Fecha" required htmlFor="rf_date">
            <Input id="rf_date" type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} />
          </Field>
          <Field label="Entrada" required htmlFor="rf_start">
            <Input id="rf_start" type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
          </Field>
          <Field label="Salida" required htmlFor="rf_end">
            <Input id="rf_end" type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Personas" required htmlFor="rf_guests">
            <Input id="rf_guests" type="number" min={1} value={form.guests} onChange={(e) => set('guests', e.target.value)} />
          </Field>
          <Field label="Tipo de evento" htmlFor="rf_type">
            <Input id="rf_type" value={form.event_type} onChange={(e) => set('event_type', e.target.value)} placeholder="Cumpleaños" />
          </Field>
          <Field label="Estado" htmlFor="rf_status">
            <Select id="rf_status" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Finalizada</option>
            </Select>
          </Field>
        </div>

        <Field label="Comentarios del cliente" htmlFor="rf_notes">
          <Textarea id="rf_notes" className="min-h-20" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </Field>

        <Field label="Notas internas" hint="Solo visibles para el equipo." htmlFor="rf_internal">
          <Textarea id="rf_internal" className="min-h-20" value={form.internal_notes} onChange={(e) => set('internal_notes', e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}
