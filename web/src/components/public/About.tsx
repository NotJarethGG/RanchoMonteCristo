import { CalendarHeart, LayoutGrid, MapPin, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { Ranch } from '@/types'

export function About({ ranch }: { ranch?: Ranch }) {
  const cards = [
    {
      icon: Users,
      title: 'Capacidad',
      value: `Hasta ${ranch?.capacity ?? 120} personas`,
      detail: 'Espacio cómodo para grupos grandes sin sentirse apretados.',
    },
    {
      icon: MapPin,
      title: 'Ubicación',
      value: [ranch?.location.city, ranch?.location.province].filter(Boolean).join(', ') || '—',
      detail: ranch?.location.address ?? 'Acceso directo en vehículo hasta la propiedad.',
    },
    {
      icon: CalendarHeart,
      title: 'Tipo de eventos',
      value: `${ranch?.event_types?.length ?? 0} tipos de evento`,
      detail: (ranch?.event_types ?? []).slice(0, 4).join(' · ') || '—',
    },
    {
      icon: LayoutGrid,
      title: 'Áreas disponibles',
      value: `${ranch?.areas?.length ?? 0} áreas`,
      detail: (ranch?.areas ?? []).slice(0, 4).join(' · ') || '—',
    },
  ]

  return (
    <section id="sobre-el-rancho" className="section-y scroll-mt-24 bg-cream-50">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="eyebrow">Sobre el rancho</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-forest-900 sm:text-4xl lg:text-5xl">
              Una finca privada, pensada para recibir a tu gente
            </h2>
          </div>

          <div className="space-y-5 text-base leading-relaxed text-stone-700">
            <p>{ranch?.about}</p>
            {ranch?.check_in_time && ranch?.check_out_time && (
              <p className="text-sm text-stone-600">
                El alquiler corre de {ranch.check_in_time.slice(0, 5)} a{' '}
                {ranch.check_out_time.slice(0, 5)} y se coordina la hora final según el tipo de evento.
              </p>
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {cards.map(({ icon: Icon, title, value, detail }) => (
            <Card key={title} interactive className="p-6">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-sage-100 text-forest-700">
                <Icon className="size-5" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-clay-600">{title}</p>
              <p className="mt-2 font-display text-xl text-forest-900">{value}</p>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{detail}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
