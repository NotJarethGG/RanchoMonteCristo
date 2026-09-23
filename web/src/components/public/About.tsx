import { CalendarHeart, LayoutGrid, MapPin, Users } from 'lucide-react'
import { formatTime } from '@/lib/format'
import type { Ranch } from '@/types'

/**
 * El texto del propietario y cuatro tarjetas con los datos que más se
 * preguntan. Todo sale de la configuración del rancho.
 */
export function About({ ranch }: { ranch: Ranch }) {
  const horario =
    ranch.check_in_time && ranch.check_out_time
      ? `De ${formatTime(ranch.check_in_time)} a ${formatTime(ranch.check_out_time)}`
      : null

  const tarjetas = [
    {
      icon: Users,
      titulo: 'Capacidad',
      valor: `Hasta ${ranch.capacity} personas`,
      detalle: horario ?? 'Espacio cómodo para grupos grandes.',
    },
    {
      icon: MapPin,
      titulo: 'Ubicación',
      valor: [ranch.location.city, ranch.location.province].filter(Boolean).join(', ') || '—',
      detalle: ranch.location.address ?? '',
    },
    {
      icon: CalendarHeart,
      titulo: 'Para qué se usa',
      valor: `${ranch.event_types.length} tipos de evento`,
      detalle: ranch.event_types.slice(0, 4).join(' · '),
    },
    {
      icon: LayoutGrid,
      titulo: 'Áreas',
      valor: `${ranch.areas.length} áreas`,
      detalle: ranch.areas.slice(0, 4).join(' · '),
    },
  ]

  return (
    <section id="sobre-el-rancho" className="scroll-mt-20 bg-white py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">El lugar</h2>

        {ranch.about && (
          <p className="mt-10 max-w-4xl font-display text-2xl leading-snug text-forest-900 sm:text-[1.7rem]">
            {ranch.about}
          </p>
        )}

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tarjetas.map(({ icon: Icon, titulo, valor, detalle }, index) => (
            <li
              key={titulo}
              className="relative rounded-xl border border-forest-900/10 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="absolute top-5 right-5 font-mono text-xs text-stone-600">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon className="size-7 text-moss-600" strokeWidth={1.5} aria-hidden="true" />
              <p className="rotulo mt-6 text-moss-600">{titulo}</p>
              <p className="mt-2 font-display text-2xl leading-tight font-bold text-forest-900">{valor}</p>
              {detalle && <p className="mt-2 text-sm leading-relaxed text-stone-600">{detalle}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
