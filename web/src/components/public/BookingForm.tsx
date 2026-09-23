import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from '@/lib/validation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { useRequestReservation } from '@/hooks/usePublicData'
import { normalizeError } from '@/lib/api'
import { formatDateShort, whatsappLink } from '@/lib/format'
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
      <section id="reservar" className="grano scroll-mt-20 bg-cream-50 py-20 lg:py-28">
        <div className="container-page max-w-2xl">
          <div className="relative border-2 border-forest-900 bg-cream-50 px-8 py-12 text-center sm:px-14">
            {/* Sello de «recibida», como el que se estampa en una boleta. */}
            <p
              aria-hidden="true"
              className="mx-auto inline-block -rotate-6 border-4 border-clay-600 px-5 py-1 font-display text-4xl font-extrabold tracking-[0.12em] text-clay-600 uppercase"
            >
              Recibida
            </p>
            <h2 className="mt-8 font-display text-3xl font-bold text-forest-900">Ya tenemos tu solicitud</h2>
            <p className="mt-4 leading-relaxed text-stone-600">
              La fecha queda como <strong className="text-forest-900">pendiente</strong> hasta que hablemos.
              Te escribimos o llamamos pronto para confirmar el precio y coordinar el adelanto.
            </p>
            <button onClick={() => mutation.reset()} className="enlace mt-8">
              Enviar otra solicitud
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Campos subrayados, como los de una boleta impresa que se llena a mano.
  const linea =
    'rounded-none border-0 border-b-2 border-forest-900/35 bg-transparent px-0 text-base text-forest-900 placeholder:text-stone-600/60 focus:border-clay-600 focus:ring-0'
  const etiqueta = 'rotulo text-forest-900'

  return (
    <section id="reservar" className="grano scroll-mt-20 bg-cream-50 py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">Apartá tu fecha</h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div className="space-y-5 text-lg leading-relaxed text-stone-600">
            <p>
              Llená la boleta y te llamamos o escribimos para confirmar el precio y cómo apartar el día.
            </p>
            <p>Nada queda confirmado hasta que hablemos con vos.</p>
            {ranch?.contact.whatsapp && (
              <p className="border-t-2 border-forest-900 pt-5 text-base">
                ¿Preferís escribir directo?{' '}
                <a
                  href={whatsappLink(ranch.contact.whatsapp, 'Hola, quisiera apartar una fecha en el rancho.')}
                  target="_blank"
                  rel="noreferrer"
                  className="enlace"
                >
                  WhatsApp al {ranch.contact.phone}
                </a>
              </p>
            )}
          </div>

          <div className="relative rounded-md border-2 border-forest-900 bg-cream-50 shadow-soft">
            {/* Encabezado de la boleta, separado por una línea troquelada con
                sus dos muescas, como un talonario. */}
            <div className="relative flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-dashed border-forest-900 px-6 py-5 sm:px-8">
              <p className="font-display text-2xl font-extrabold tracking-[0.06em] text-forest-900 uppercase">
                Solicitud de fecha
              </p>
              <p className="font-mono text-sm text-stone-600">
                {selectedDate ? `Para el ${formatDateShort(selectedDate)}` : 'Fecha por definir'}
              </p>
              <span
                aria-hidden="true"
                className="absolute -bottom-[13px] -left-[14px] size-6 rounded-full border-2 border-forest-900 bg-cream-50 [clip-path:inset(0_0_0_50%)]"
              />
              <span
                aria-hidden="true"
                className="absolute -right-[14px] -bottom-[13px] size-6 rounded-full border-2 border-forest-900 bg-cream-50 [clip-path:inset(0_50%_0_0)]"
              />
            </div>

            <form onSubmit={onSubmit} noValidate className="space-y-7 px-6 py-8 sm:px-8">
              {/* Señuelo anti-spam: invisible para personas y lectores de
                  pantalla, pero los bots completan todos los campos. El
                  backend descarta la solicitud si llega con valor. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">No completar este campo</label>
                <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                <Field label="Nombre completo" required error={errors.full_name?.message} htmlFor="full_name" labelClassName={etiqueta}>
                  <Input id="full_name" autoComplete="name" className={linea} invalid={!!errors.full_name} {...register('full_name')} />
                </Field>

                <Field label="Teléfono" required error={errors.phone?.message} htmlFor="phone" labelClassName={etiqueta}>
                  <Input id="phone" type="tel" autoComplete="tel" className={linea} invalid={!!errors.phone} {...register('phone')} />
                </Field>
              </div>

              <Field
                label="Correo (opcional)"
                error={errors.email?.message}
                htmlFor="email"
                labelClassName={etiqueta}
                hint="Solo si querés la confirmación por escrito."
              >
                <Input id="email" type="email" autoComplete="email" className={linea} invalid={!!errors.email} {...register('email')} />
              </Field>

              <div className="grid gap-7 sm:grid-cols-3">
                <Field label="Fecha" required error={errors.event_date?.message} htmlFor="event_date" labelClassName={etiqueta}>
                  <Input id="event_date" type="date" className={linea} invalid={!!errors.event_date} {...register('event_date')} />
                </Field>
                <Field label="Llegada" required error={errors.start_time?.message} htmlFor="start_time" labelClassName={etiqueta}>
                  <Input id="start_time" type="time" className={linea} invalid={!!errors.start_time} {...register('start_time')} />
                </Field>
                <Field label="Salida" required error={errors.end_time?.message} htmlFor="end_time" labelClassName={etiqueta}>
                  <Input id="end_time" type="time" className={linea} invalid={!!errors.end_time} {...register('end_time')} />
                </Field>
              </div>

              <div className="grid gap-7 sm:grid-cols-2">
                <Field label="Personas" required error={errors.guests?.message} htmlFor="guests" labelClassName={etiqueta}>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={ranch?.capacity ?? 1000}
                    className={linea}
                    invalid={!!errors.guests}
                    {...register('guests')}
                  />
                </Field>
                <Field label="Qué celebran" error={errors.event_type?.message} htmlFor="event_type" labelClassName={etiqueta}>
                  <Select id="event_type" className={linea} {...register('event_type')}>
                    <option value="">Elegí una opción</option>
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
                label="Algo más que debamos saber"
                error={errors.notes?.message}
                htmlFor="notes"
                labelClassName={etiqueta}
                hint="Si llevan comida, música, decoración o necesitan llegar más temprano."
              >
                <Textarea
                  id="notes"
                  className="min-h-24 rounded-none border-2 border-dashed border-forest-900/35 bg-transparent text-forest-900 focus:border-clay-600 focus:ring-0"
                  {...register('notes')}
                />
              </Field>

              <div className="flex flex-col gap-4 border-t-2 border-forest-900 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-stone-600">
                  Al enviarla, la fecha queda <strong className="text-forest-900">pendiente</strong>, no
                  confirmada.
                </p>
                <button type="submit" disabled={mutation.isPending} className="boton w-full disabled:opacity-60 sm:w-auto">
                  {mutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  Enviar solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
