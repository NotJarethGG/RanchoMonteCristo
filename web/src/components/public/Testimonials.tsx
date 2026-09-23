import { formatDate } from '@/lib/format'
import type { Testimonial } from '@/types'

/**
 * Tarjetas sobre verde bosque. Sin estrellas ni avatares con iniciales: el
 * texto de la persona es lo que convence.
 */
export function Testimonials({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  if (!testimonials.length) return null

  return (
    <section className="bg-forest-900 py-20 text-cream-50 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion text-cream-50 after:bg-cream-50">Lo que nos han dicho</h2>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <li key={testimonial.id}>
              <figure className="flex h-full flex-col rounded-xl border border-cream-50/12 bg-forest-800 p-6">
                <span aria-hidden="true" className="font-display text-5xl leading-none text-gold-500">
                  «
                </span>
                <blockquote className="mt-2 flex-1 leading-relaxed text-cream-50/90">
                  {testimonial.content}
                </blockquote>
                <figcaption className="mt-6 border-t border-cream-50/12 pt-4">
                  <p className="text-sm font-semibold text-cream-50">{testimonial.author_name}</p>
                  <p className="mt-1 font-mono text-xs text-gold-500">
                    {[testimonial.event_type, testimonial.event_date && formatDate(testimonial.event_date, 'MMM yyyy')]
                      .filter(Boolean)
                      .join('  ·  ')}
                  </p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
