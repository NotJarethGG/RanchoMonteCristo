import { useState } from 'react'
import { MonthCalendar, CalendarLegend } from '@/components/calendar/MonthCalendar'
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
 * Calendario de fechas libres. Al elegir un día aparece el cálculo del precio
 * con su desglose y el total abajo.
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
    <section id="disponibilidad" className="scroll-mt-20 bg-gris-50 py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">Fechas libres</h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
          Tocá un día en blanco para ver cuánto sale. La fecha queda apartada cuando la
          confirmamos con vos por teléfono o WhatsApp.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <div className="rounded-xl border border-forest-900/10 bg-white shadow-soft p-5 sm:p-7">
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
                impreso
                loading={isFetching && !isLoading}
              />
            )}

            <div className="mt-7 border-t border-forest-900/10 pt-5">
              <CalendarLegend items={['available', 'pending', 'reserved', 'blocked']} impreso />
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {selectedDate ? (
              <div className="rounded-xl border border-forest-900/10 bg-white shadow-soft">
                <div className="border-b border-forest-900/10 px-6 py-5">
                  <p className="rotulo text-clay-600">Fecha elegida</p>
                  <p className="mt-2 font-display text-3xl leading-none font-bold text-forest-900 first-letter:uppercase">
                    {formatWeekday(selectedDate)}
                  </p>
                  <p className="mt-1 text-stone-600">{formatDate(selectedDate)}</p>
                </div>

                <div className="border-b border-forest-900/10 px-6 py-5">
                  <label htmlFor="availability-guests" className="block text-sm font-semibold text-forest-900">
                    ¿Cuántas personas, más o menos?
                  </label>
                  <div className="mt-3 flex items-center gap-4">
                    <input
                      id="availability-guests"
                      type="range"
                      min={10}
                      max={ranch?.capacity ?? 120}
                      step={5}
                      value={guests}
                      onChange={(event) => onGuestsChange(Number(event.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-forest-900/15 accent-clay-600"
                    />
                    <span className="w-14 shrink-0 text-right font-mono text-xl text-forest-900">{guests}</span>
                  </div>
                </div>

                {/* Desglose: cada regla de precio en un renglón. */}
                <div className="px-6 py-5">
                  {quoteLoading ? (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <Spinner className="size-4" /> Calculando…
                    </div>
                  ) : quote ? (
                    <>
                      <ul className="space-y-2.5 text-sm text-forest-900">
                        {quote.quote.lines.map((line) => (
                          <li
                            key={line.rule_id}
                            className="flex items-baseline justify-between gap-4"
                          >
                            <span>{line.name}</span>
                            <span className="shrink-0 font-mono tabular-nums">{formatMoney(line.computed)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 flex items-baseline justify-between border-t border-forest-900/10 pt-4">
                        <span className="font-semibold text-forest-900">Total estimado</span>
                        <span className="font-display text-3xl font-bold text-forest-900">
                          {formatMoney(quote.quote.total)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-stone-600">
                        Es un precio de referencia. La fecha se aparta con un adelanto de{' '}
                        <span className="font-mono">{formatMoney(quote.quote.deposit)}</span> y el
                        precio final lo confirmamos al hablar con vos.
                      </p>
                    </>
                  ) : null}

                  <button onClick={onContinue} className="boton mt-6 w-full">
                    Pedir esta fecha
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex grow flex-col justify-center rounded-xl border border-forest-900/10 bg-white shadow-soft p-8">
                <p className="font-display text-3xl leading-tight font-bold text-forest-900">
                  <span aria-hidden="true" className="mr-2 hidden text-clay-600 lg:inline">
                    ←
                  </span>
                  Elegí un día en el calendario
                </p>
                <p className="mt-3 max-w-sm leading-relaxed text-stone-600">
                  Te mostramos al momento cuánto sale para la cantidad de personas que vengan.
                </p>
              </div>
            )}

            {ranch?.policies && (
              <div>
                <h3 className="rotulo text-forest-900">Cómo se aparta la fecha</h3>
                <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-stone-600">
                  {ranch.policies}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
