import { formatDate } from '@/lib/format'
import type { Testimonial } from '@/types'

function Firma({ testimonial }: { testimonial: Testimonial }) {
  return (
    <p className="mt-5 text-sm">
      <span className="font-semibold text-cream-50">{testimonial.author_name}</span>
      <span className="font-mono text-gold-500">
        {[testimonial.event_type, testimonial.event_date && formatDate(testimonial.event_date, 'MMM yyyy')]
          .filter(Boolean)
          .map((parte) => `  ·  ${parte}`)
          .join('')}
      </span>
    </p>
  )
}

/**
 * Citas tipográficas sobre verde oscuro: la primera en grande y el resto en columnas.
 * Sin estrellas ni avatares: el texto de la persona es lo que convence.
 */
export function Testimonials({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  if (!testimonials.length) return null
  const [principal, ...resto] = testimonials

  return (
    <section className="bg-forest-900 py-20 text-cream-50 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion text-cream-50 after:bg-cream-50">Lo que nos han dicho</h2>

        <figure className="mt-14 max-w-4xl">
          <blockquote className="font-display text-3xl leading-snug font-bold sm:text-4xl lg:text-[2.75rem]">
            <span aria-hidden="true" className="mr-1 text-gold-500">«</span>
            {principal.content}
            <span aria-hidden="true" className="ml-1 text-gold-500">»</span>
          </blockquote>
          <figcaption>
            <Firma testimonial={principal} />
          </figcaption>
        </figure>

        {!!resto.length && (
          <div className="mt-16 grid gap-10 border-t-2 border-cream-50/25 pt-10 md:grid-cols-3">
            {resto.map((testimonial) => (
              <figure key={testimonial.id}>
                <blockquote className="text-lg leading-relaxed text-cream-50/90">
                  «{testimonial.content}»
                </blockquote>
                <figcaption>
                  <Firma testimonial={testimonial} />
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
