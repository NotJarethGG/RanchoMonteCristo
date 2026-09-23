import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from '@/lib/validation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { useRequestReservation } from '@/hooks/usePublicData'
import { normalizeError } from '@/lib/api'
import { formatDate, whatsappLink } from '@/lib/format'
import { useLang, useT, useTr, type Textos } from '@/lib/i18n'
import type { Ranch } from '@/types'

/** Los mensajes de validación salen en el idioma de la página. */
const crearSchema = (e: Textos['booking']['errores']) =>
  z
    .object({
      full_name: z.string().min(3, e.nombre),
      phone: z.string().min(8, e.telefono),
      email: z.union([z.string().email(e.correo), z.literal('')]).optional(),
      event_date: z.string().min(1, e.fecha),
      start_time: z.string().min(1, e.entrada),
      end_time: z.string().min(1, e.salidaFalta),
      guests: z.coerce.number().int().min(1, e.personas),
      event_type: z.string().optional(),
      notes: z.string().max(2000).optional(),
      website: z.string().optional(),
    })
    .refine((data) => data.end_time > data.start_time, {
      message: e.salida,
      path: ['end_time'],
    })

export type BookingFormValues = z.input<ReturnType<typeof crearSchema>>

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
  const lang = useLang()
  const t = useT()
  const b = t.booking
  const tr = useTr()
  const schema = useMemo(() => crearSchema(b.errores), [b])

  // En inglés se muestran los tipos traducidos, pero se envía el nombre en
  // español: así el panel los ve siempre iguales.
  const tiposEvento = ranch?.event_types ?? []
  const tiposMostrados = ranch ? tr(ranch, 'event_types') : []
  const etiquetaTipo = (i: number) =>
    tiposMostrados.length === tiposEvento.length ? tiposMostrados[i] : tiposEvento[i]

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
        locale: lang,
      })
      toast.success(b.servidor?.enviada ?? result.message)
      reset()
    } catch (error) {
      const normalized = normalizeError(error)
      // Los errores de validación del servidor se pintan sobre cada campo.
      // El servidor contesta en español; en inglés se usan mensajes propios.
      Object.entries(normalized.errors).forEach(([field, messages]) => {
        const message = b.servidor
          ? field === 'event_date'
            ? b.servidor.fecha
            : b.servidor.campo
          : messages[0]
        setError(field as keyof BookingFormValues, { message })
      })
      toast.error(b.servidor?.general ?? normalized.message)
    }
  })

  if (mutation.isSuccess) {
    return (
      <section id="reservar" className="scroll-mt-20 bg-white py-20 lg:py-28">
        <div className="container-page max-w-2xl">
          <div className="relative rounded-xl border border-forest-900/10 bg-white px-8 py-12 text-center shadow-soft sm:px-14">
            {/* Sello de «recibida», como el que se estampa en una boleta. */}
            <p
              aria-hidden="true"
              className="mx-auto inline-block -rotate-6 rounded-md border-4 border-moss-600 px-5 py-1 font-display text-4xl font-extrabold tracking-[0.12em] text-moss-600 uppercase"
            >
              {b.recibida}
            </p>
            <h2 className="mt-8 font-display text-3xl font-bold text-forest-900">{b.recibidaTitulo}</h2>
            <p className="mt-4 leading-relaxed text-stone-600">
              {b.recibidaAntes} <strong className="text-forest-900">{b.pendiente}</strong> {b.recibidaDespues}
            </p>
            <button onClick={() => mutation.reset()} className="enlace mt-8">
              {b.otra}
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="reservar" className="scroll-mt-20 bg-white py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">{b.titulo}</h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div className="space-y-5 text-lg leading-relaxed text-stone-600">
            <p>{b.intro1}</p>
            <p>{b.intro2}</p>
            {ranch?.contact.whatsapp && (
              <p className="border-t border-forest-900/10 pt-5 text-base">
                {b.directo}{' '}
                <a
                  href={whatsappLink(ranch.contact.whatsapp, t.whatsapp.apartar)}
                  target="_blank"
                  rel="noreferrer"
                  className="enlace"
                >
                  {b.whatsappAl} {ranch.contact.phone}
                </a>
              </p>
            )}
          </div>

          <div className="rounded-xl border border-forest-900/10 bg-white shadow-soft">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-forest-900/10 px-6 py-5 sm:px-8">
              <p className="font-display text-2xl font-bold text-forest-900">{b.solicitud}</p>
              <p className="font-mono text-sm text-stone-600">
                {selectedDate ? b.para(formatDate(selectedDate, t.fechas.corta, lang)) : b.sinFecha}
              </p>
            </div>

            <form onSubmit={onSubmit} noValidate className="space-y-5 px-6 py-7 sm:px-8">
              {/* Señuelo anti-spam: invisible para personas y lectores de
                  pantalla, pero los bots completan todos los campos. El
                  backend descarta la solicitud si llega con valor. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">{b.senuelo}</label>
                <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={b.nombre} required error={errors.full_name?.message} htmlFor="full_name">
                  <Input id="full_name" autoComplete="name" invalid={!!errors.full_name} {...register('full_name')} />
                </Field>

                <Field label={b.telefono} required error={errors.phone?.message} htmlFor="phone" hint={b.telefonoHint}>
                  <Input id="phone" type="tel" autoComplete="tel" invalid={!!errors.phone} {...register('phone')} />
                </Field>
              </div>

              <Field
                label={b.correo}
                error={errors.email?.message}
                htmlFor="email"
               
                hint={b.correoHint}
              >
                <Input id="email" type="email" autoComplete="email" invalid={!!errors.email} {...register('email')} />
              </Field>

              <div className="grid gap-5 sm:grid-cols-3">
                <Field label={b.fecha} required error={errors.event_date?.message} htmlFor="event_date">
                  <Input id="event_date" type="date" invalid={!!errors.event_date} {...register('event_date')} />
                </Field>
                <Field label={b.llegada} required error={errors.start_time?.message} htmlFor="start_time">
                  <Input id="start_time" type="time" invalid={!!errors.start_time} {...register('start_time')} />
                </Field>
                <Field label={b.salida} required error={errors.end_time?.message} htmlFor="end_time">
                  <Input id="end_time" type="time" invalid={!!errors.end_time} {...register('end_time')} />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={b.personas} required error={errors.guests?.message} htmlFor="guests">
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={ranch?.capacity ?? 1000}
                   
                    invalid={!!errors.guests}
                    {...register('guests')}
                  />
                </Field>
                <Field label={b.celebran} error={errors.event_type?.message} htmlFor="event_type">
                  <Select id="event_type" {...register('event_type')}>
                    <option value="">{b.elegiOpcion}</option>
                    {tiposEvento.map((type, i) => (
                      <option key={type} value={type}>
                        {etiquetaTipo(i)}
                      </option>
                    ))}
                    <option value="Otro">{b.otro}</option>
                  </Select>
                </Field>
              </div>

              <Field
                label={b.notas}
                error={errors.notes?.message}
                htmlFor="notes"
               
                hint={b.notasHint}
              >
                <Textarea
                  id="notes"
                  className="min-h-24"
                  {...register('notes')}
                />
              </Field>

              <div className="flex flex-col gap-4 border-t border-forest-900/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-stone-600">
                  {b.pendienteAntes} <strong className="text-forest-900">{b.pendiente}</strong>
                  {b.pendienteDespues}
                </p>
                <button type="submit" disabled={mutation.isPending} className="boton w-full disabled:opacity-60 sm:w-auto">
                  {mutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                  {b.enviar}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
