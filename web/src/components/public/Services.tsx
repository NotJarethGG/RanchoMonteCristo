import { Card } from '@/components/ui/Card'
import { ServiceIcon } from '@/components/ui/Icon'
import type { Service } from '@/types'

export function Services({ services = [] }: { services?: Service[] }) {
  if (!services.length) return null

  return (
    <section id="servicios" className="section-y scroll-mt-24 bg-cream-50">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Servicios</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-forest-900 sm:text-4xl lg:text-5xl">
            Todo lo que incluye el alquiler
          </h2>
          <p className="mt-5 text-base leading-relaxed text-stone-700">
            El rancho se alquila completo. Estas son las áreas y servicios que quedan a disposición
            de tu grupo durante todo el día del evento.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Card key={service.id} interactive className="group p-6">
              <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-forest-800 text-gold-500 transition-colors group-hover:bg-clay-600 group-hover:text-cream-50">
                <ServiceIcon name={service.icon} className="size-5.5" />
              </div>
              <h3 className="font-display text-xl text-forest-900">{service.name}</h3>
              {service.description && (
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{service.description}</p>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
