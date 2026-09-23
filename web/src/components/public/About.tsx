import { formatTime } from '@/lib/format'
import type { Ranch } from '@/types'

/**
 * El texto del propietario a la izquierda y, a la derecha, una ficha con los
 * datos duros: la clase de tabla que uno encuentra en el tablero de una
 * finca, no cuatro tarjetas con íconos. Todo sale de la configuración.
 */
export function About({ ranch }: { ranch: Ranch }) {
  const horario =
    ranch.check_in_time && ranch.check_out_time
      ? `${formatTime(ranch.check_in_time)} a ${formatTime(ranch.check_out_time)}`
      : null

  const filas = [
    { dato: 'Capacidad', valor: ranch.capacity ? `hasta ${ranch.capacity} personas` : null },
    { dato: 'Horario', valor: horario },
    { dato: 'Modalidad', valor: 'completo, un grupo por día' },
    {
      dato: 'Ubicación',
      valor: [ranch.location.city, ranch.location.province].filter(Boolean).join(', ') || null,
    },
  ].filter((fila): fila is { dato: string; valor: string } => Boolean(fila.valor))

  return (
    <section id="sobre-el-rancho" className="grano scroll-mt-20 bg-cream-50 py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">El lugar</h2>

        <div className="mt-12 grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            {ranch.about && (
              <p className="font-display text-2xl leading-snug text-forest-900 sm:text-[1.7rem]">
                {ranch.about}
              </p>
            )}

            {!!ranch.event_types.length && (
              <div className="mt-10">
                <p className="rotulo text-stone-600">Se usa para</p>
                <p className="mt-3 text-lg leading-relaxed text-forest-900">
                  {ranch.event_types.join(' / ')}
                </p>
              </div>
            )}
          </div>

          <div className="border-2 border-forest-900 bg-sand-100/60">
            <p className="rotulo border-b-2 border-forest-900 px-5 py-3 text-forest-900">Ficha del rancho</p>

            <dl className="px-5 py-2">
              {filas.map((fila) => (
                <div key={fila.dato} className="flex items-baseline gap-3 border-b border-dashed border-forest-900/30 py-4 last:border-0">
                  {/* Los puntos guía van como pseudo-elemento: un <span> suelto
                      dentro del <dl> invalidaría su estructura. */}
                  <dt className="flex flex-1 items-baseline gap-3 text-sm font-semibold text-forest-900 after:min-w-6 after:flex-1 after:translate-y-[-3px] after:border-b-2 after:border-dotted after:border-forest-900/35 after:content-['']">
                    {fila.dato}
                  </dt>
                  <dd className="text-right font-mono text-sm text-forest-900">{fila.valor}</dd>
                </div>
              ))}
            </dl>

            {!!ranch.areas.length && (
              <div className="border-t-2 border-forest-900 px-5 py-4">
                <p className="rotulo text-stone-600">Áreas</p>
                <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-forest-900">
                  {ranch.areas.map((area) => (
                    <li key={area} className="before:mr-1.5 before:text-clay-600 before:content-['▪']">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
