import type { Service } from '@/types'

/**
 * Inventario escrito, no una grilla de tarjetas con íconos: el número, el
 * nombre grande en la slab y la descripción debajo, separados por reglas.
 * Se lee de un vistazo, como la lista de lo que trae una finca.
 */
export function Services({ services = [] }: { services?: Service[] }) {
  if (!services.length) return null

  return (
    <section id="servicios" className="grano scroll-mt-20 bg-cream-50 py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">Lo que hay</h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
          Todo viene con el alquiler. Durante el día el rancho es solo de tu grupo.
        </p>

        <ol className="mt-12 grid border-t-2 border-forest-900 md:grid-cols-2 md:gap-x-16">
          {services.map((service, index) => (
            <li
              key={service.id}
              className="grid grid-cols-[3rem_1fr] items-baseline gap-x-2 border-b border-forest-900/25 py-6"
            >
              <span className="font-mono text-sm text-clay-600">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-display text-2xl leading-tight font-bold text-forest-900">{service.name}</h3>
                {service.description && (
                  <p className="mt-1.5 leading-relaxed text-stone-600">{service.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
