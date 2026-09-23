import { ServiceIcon } from '@/components/ui/Icon'
import type { Service } from '@/types'

/**
 * Una tarjeta por servicio. El ícono sale del nombre guardado en la base
 * (editable desde el panel) y el número de orden refuerza que es una lista
 * de lo que trae el alquiler.
 */
export function Services({ services = [] }: { services?: Service[] }) {
  if (!services.length) return null

  return (
    <section id="servicios" className="scroll-mt-20 bg-cream-50 py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">Lo que hay</h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
          Todo viene con el alquiler. Durante el día el rancho es solo de tu grupo.
        </p>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <li
              key={service.id}
              className="group relative rounded-xl border border-forest-900/10 bg-white p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="absolute top-5 right-5 font-mono text-xs text-stone-600">
                {String(index + 1).padStart(2, '0')}
              </span>
              <ServiceIcon
                name={service.icon}
                className="size-8 text-forest-900 transition-colors group-hover:text-clay-600"
              />
              <h3 className="mt-6 font-display text-2xl leading-tight font-bold text-forest-900">
                {service.name}
              </h3>
              {service.description && (
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{service.description}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
