import { Quote, Star } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { formatDate, initials } from '@/lib/format'
import type { Testimonial } from '@/types'

export function Testimonials({ testimonials = [] }: { testimonials?: Testimonial[] }) {
  if (!testimonials.length) return null

  return (
    <section className="section-y bg-forest-900">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">
            Testimonios
          </p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-cream-50 sm:text-4xl lg:text-5xl">
            Lo que dicen quienes ya celebraron acá
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="flex flex-col border-sage-200/12 bg-forest-800 p-6 shadow-none"
            >
              <Quote className="size-7 text-gold-500/50" strokeWidth={1.5} />

              <p className="mt-4 flex-1 text-sm leading-relaxed text-sage-200">
                {testimonial.content}
              </p>

              <div className="mt-6 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      'size-3.5',
                      index < testimonial.rating
                        ? 'fill-gold-500 text-gold-500'
                        : 'text-sage-200/25',
                    )}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-sage-200/12 pt-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-xs font-semibold text-gold-500">
                  {initials(testimonial.author_name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-cream-50">
                    {testimonial.author_name}
                  </p>
                  <p className="truncate text-xs text-sage-400">
                    {[testimonial.event_type, testimonial.event_date && formatDate(testimonial.event_date, 'MMM yyyy')]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
