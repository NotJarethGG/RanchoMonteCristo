import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/Card'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useRequestReservation } from '@/hooks/usePublicData'
import { normalizeError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import type { Ranch } from '@/types'

const schema = z
  .object({
    full_name: z.string().min(3, 'Escribí tu nombre completo.'),
    phone: z.string().min(8, 'Necesitamos un teléfono de al menos 8 dígitos.'),
    email: z.union([z.string().email('Revisá el formato del correo.'), z.literal('')]).optional(),
    event_date: z.string().min(1, 'Elegí la fecha del evento.'),
    start_time: z.string().min(1, 'Indicá la hora de entrada.'),
    end_time: z.string().min(1, 'Indicá la hora de salida.'),
    guests: z.coerce.number().int().min(1, 'Indicá al menos una persona.'),
    event_type: z.string().optional(),
    notes: z.string().max(2000).optional(),
    website: z.string().optional(),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: 'La salida debe ser después de la entrada.',
    path: ['end_time'],
  })

export type BookingFormValues = z.input<typeof schema>

export function BookingForm({
  ranch,
  selectedDate,
  guests,
}: {
  ranch?: Ranch
  selectedDate: string | null
  /** Cantidad estimada elegida en el calendario. */
  guests: number
}) {
  const mutation = useRequestReservation()

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      start_time: ranch?.check_in_time?.slice(0, 5) ?? '09:00',
      end_time: ranch?.check_out_time?.slice(0, 5) ?? '18:00',
      guests,
      event_date: selectedDate ?? '',
    },
  })

  // Lo elegido en el calendario alimenta el formulario.
  useEffect(() => {
    if (selectedDate) setValue('event_date', selectedDate, { shouldValidate: true })
  }, [selectedDate, setValue])

  useEffect(() => {
    setValue('guests', guests)
  }, [guests, setValue])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await mutation.mutateAsync({
        ...values,
        guests: Number(values.guests),
        email: values.email || undefined,
      })
      toast.success(result.message)
      reset()
    } catch (error) {
      const normalized = normalizeError(error)
      // Los errores de validación del servidor se pintan sobre cada campo.
      Object.entries(normalized.errors).forEach(([field, messages]) => {
        setError(field as keyof BookingFormValues, { message: messages[0] })
      })
      toast.error(normalized.message)
    }
  })

  if (mutation.isSuccess) {
    return (
      <section id="reservar" className="section-y scroll-mt-24 bg-cream-50">
        <div className="container-page max-w-2xl">
          <Card className="animate-scale-in p-10 text-center sm:p-14">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-ok-100 text-ok-600">
              <CheckCircle2 className="size-8" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-3xl text-forest-900">¡Recibimos tu solicitud!</h2>
            <p className="mt-4 leading-relaxed text-stone-700">
              Tu fecha queda apartada como <strong>pendiente</strong> mientras la revisamos.
              Te contactamos por teléfono o WhatsApp para confirmarla y coordinar el adelanto.
            </p>
            <Button className="mt-8" variant="outline" onClick={() => mutation.reset()}>
              Enviar otra solicitud
            </Button>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id="reservar" className="section-y scroll-mt-24 bg-cream-50">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Reservar</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-forest-900 sm:text-4xl lg:text-5xl">
              Solicitá tu fecha
            </h2>
            <p className="mt-5 text-base leading-relaxed text-stone-700">
              Completá el formulario y nos ponemos en contacto para confirmar disponibilidad,
              precio final y la forma de apartar el día.
            </p>

            {selectedDate && (
              <div className="mt-7 rounded-xl2 border border-clay-600/20 bg-clay-100/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-700">
                  Fecha seleccionada
                </p>
                <p className="mt-1 font-display text-xl text-forest-900">
                  {formatDate(selectedDate)}
                </p>
              </div>
            )}
          </div>

          <Card className="p-6 sm:p-8">
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              {/* Señuelo anti-spam: invisible para personas y lectores de
                  pantalla, pero los bots completan todos los campos. El
                  backend descarta la solicitud si llega con valor. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">No completar este campo</label>
                <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nombre completo" required error={errors.full_name?.message} htmlFor="full_name">
                  <Input id="full_name" placeholder="Ana Rodríguez" invalid={!!errors.full_name} {...register('full_name')} />
                </Field>

                <Field label="Teléfono" required error={errors.phone?.message} htmlFor="phone">
                  <Input id="phone" type="tel" placeholder="8888-1122" invalid={!!errors.phone} {...register('phone')} />
                </Field>
              </div>

              <Field
                label="Correo electrónico"
                error={errors.email?.message}
                htmlFor="email"
                hint="Opcional, para enviarte la confirmación por escrito."
              >
                <Input id="email" type="email" placeholder="ana@correo.com" invalid={!!errors.email} {...register('email')} />
              </Field>

              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Fecha" required error={errors.event_date?.message} htmlFor="event_date">
                  <Input id="event_date" type="date" invalid={!!errors.event_date} {...register('event_date')} />
                </Field>

                <Field label="Entrada" required error={errors.start_time?.message} htmlFor="start_time">
                  <Input id="start_time" type="time" invalid={!!errors.start_time} {...register('start_time')} />
                </Field>

                <Field label="Salida" required error={errors.end_time?.message} htmlFor="end_time">
                  <Input id="end_time" type="time" invalid={!!errors.end_time} {...register('end_time')} />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Cantidad de personas" required error={errors.guests?.message} htmlFor="guests">
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={ranch?.capacity ?? 1000}
                    invalid={!!errors.guests}
                    {...register('guests')}
                  />
                </Field>

                <Field label="Tipo de evento" error={errors.event_type?.message} htmlFor="event_type">
                  <Select id="event_type" {...register('event_type')}>
                    <option value="">Seleccioná una opción</option>
                    {(ranch?.event_types ?? []).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                    <option value="Otro">Otro</option>
                  </Select>
                </Field>
              </div>

              <Field
                label="Comentarios"
                error={errors.notes?.message}
                htmlFor="notes"
                hint="Contanos si llevás catering, música, decoración o algo especial."
              >
                <Textarea id="notes" placeholder="Queremos llevar música y decorar el rancho desde temprano…" {...register('notes')} />
              </Field>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-stone-600">
                  Al enviar, tu fecha queda como <strong>solicitud pendiente</strong>. No se confirma
                  automáticamente.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  loading={mutation.isPending}
                  icon={<Send className="size-4" />}
                  className="w-full sm:w-auto"
                >
                  Solicitar reserva
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}
