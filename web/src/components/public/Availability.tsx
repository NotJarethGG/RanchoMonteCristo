import { useState } from 'react'
import { ArrowRight, CalendarDays, Info } from 'lucide-react'
import { MonthCalendar, CalendarLegend } from '@/components/calendar/MonthCalendar'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/States'
import { useAvailability, useQuote } from '@/hooks/usePublicData'
import { formatDate, formatMoney, formatWeekday } from '@/lib/format'
import type { Ranch } from '@/types'

interface AvailabilityProps {
  ranch?: Ranch
  selectedDate: string | null
  onSelectDate: (date: string) => void
  /** La cantidad estimada viaja al formulario de reserva. */
  guests: number
  onGuestsChange: (guests: number) => void
  onContinue: () => void
}

/**
 * Sección de consulta de fechas. El calendario es informativo y, al elegir
 * un día libre, muestra una cotización estimada antes de enviar al formulario.
 */
export function Availability({
  ranch,
  selectedDate,
  onSelectDate,
  guests,
  onGuestsChange,
  onContinue,
}: AvailabilityProps) {
  const [month, setMonth] = useState(() => new Date())

  const { data: days = [], isLoading, isFetching } = useAvailability(month)
  const { data: quote, isLoading: quoteLoading } = useQuote(selectedDate, guests)

  return (
    <section id="disponibilidad" className="section-y scroll-mt-24 bg-sand-100">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Disponibilidad</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-forest-900 sm:text-4xl lg:text-5xl">
            Consultá las fechas libres
          </h2>
          <p className="mt-5 text-base leading-relaxed text-stone-700">
            Elegí un día disponible para ver el precio estimado y continuar con tu solicitud.
            Confirmamos la fecha por teléfono o WhatsApp.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
          <Card className="p-5 sm:p-7">
            {isLoading ? (
              <div className="flex h-96 items-center justify-center">
                <Spinner className="size-6" />
              </div>
            ) : (
              <MonthCalendar
                month={month}
                onMonthChange={setMonth}
                days={days}
                selected={selectedDate}
                onSelect={onSelectDate}
                onlyAvailable
                loading={isFetching && !isLoading}
              />
            )}

            <div className="mt-7 border-t border-forest-900/8 pt-5">
              <CalendarLegend items={['available', 'pending', 'reserved', 'blocked']} />
            </div>
          </Card>

          <div className="flex flex-col gap-5">
            {selectedDate ? (
              <Card className="animate-fade-up p-6 sm:p-7">
                <p className="eyebrow">Fecha elegida</p>
                <p className="mt-2 font-display text-2xl capitalize text-forest-900">
                  {formatWeekday(selectedDate)}
                </p>
                <p className="text-stone-600">{formatDate(selectedDate)}</p>

                <div className="mt-6 space-y-2">
                  <label htmlFor="availability-guests" className="block text-sm font-medium text-forest-800">
                    ¿Cuántas personas aproximadamente?
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      id="availability-guests"
                      type="range"
                      min={10}
                      max={ranch?.capacity ?? 120}
                      step={5}
                      value={guests}
                      onChange={(event) => onGuestsChange(Number(event.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sand-300 accent-clay-600"
                    />
                    <span className="w-16 shrink-0 text-right font-display text-xl text-forest-900">
                      {guests}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-sand-100 p-5">
                  {quoteLoading ? (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Spinner className="size-4" /> Calculando…
                    </div>
                  ) : quote ? (
                    <>
                      <ul className="space-y-2 text-sm">
                        {quote.quote.lines.map((line) => (
                          <li key={line.rule_id} className="flex justify-between gap-4 text-stone-700">
                            <span>{line.name}</span>
                            <span className="shrink-0 tabular-nums">{formatMoney(line.computed)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 flex items-baseline justify-between border-t border-forest-900/10 pt-4">
                        <span className="text-sm font-medium text-forest-800">Estimado total</span>
                        <span className="font-display text-2xl text-forest-900">
                          {formatMoney(quote.quote.total)}
                        </span>
                      </div>
                      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-stone-600">
                        <Info className="mt-0.5 size-3.5 shrink-0" />
                        Precio referencial. Se aparta con un adelanto de{' '}
                        {formatMoney(quote.quote.deposit)} y se confirma al conversar con vos.
                      </p>
                    </>
                  ) : null}
                </div>

                <button
                  onClick={onContinue}
                  className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-clay-600 text-sm font-medium text-cream-50 shadow-soft transition-all hover:bg-clay-700 hover:shadow-lift active:scale-[0.99]"
                >
                  Solicitar esta fecha
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Card>
            ) : (
              <Card className="flex grow flex-col items-center justify-center p-10 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sage-100 text-forest-700">
                  <CalendarDays className="size-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl text-forest-900">Elegí una fecha</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-stone-600">
                  Tocá un día marcado como disponible en el calendario y te mostramos el precio
                  estimado para tu grupo.
                </p>
              </Card>
            )}

            {ranch?.policies && (
              <Card className="p-6">
                <h4 className="font-display text-lg text-forest-900">Cómo funciona la reserva</h4>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                  {ranch.policies}
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
