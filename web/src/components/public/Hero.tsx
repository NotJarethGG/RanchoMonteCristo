import { ArrowRight, Images, MapPin, Users } from 'lucide-react'
import type { GalleryImage, Ranch } from '@/types'

const FALLBACK =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80'

/**
 * El hero le da todo el protagonismo a la fotografía: imagen a sangre,
 * degradado oscuro para garantizar contraste del texto y un par de datos
 * duros (capacidad / ubicación) que responden la primera pregunta del visitante.
 */
export function Hero({ ranch, cover }: { ranch?: Ranch; cover?: GalleryImage }) {
  const image = cover?.url ?? ranch?.hero_image ?? FALLBACK

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden">
      <img
        src={image}
        alt={cover?.alt ?? 'Vista del rancho'}
        className="absolute inset-0 size-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-linear-to-t from-bark-950/92 via-bark-950/45 to-bark-950/45" />

      <div className="container-page relative w-full pb-16 pt-32 sm:pb-20 lg:pb-24">
        <div className="max-w-3xl animate-fade-up">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream-50/20 bg-cream-50/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-cream-50/90 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-gold-500" />
            {[ranch?.location.city, ranch?.location.province].filter(Boolean).join(', ') || 'Costa Rica'}
          </p>

          <h1 className="font-display text-4xl leading-[1.05] font-normal text-cream-50 sm:text-6xl lg:text-7xl">
            {ranch?.tagline ?? 'Un lugar para crear momentos inolvidables'}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-50/80 sm:text-lg">
            {ranch?.description ??
              'Disfrutá de nuestro rancho para tus eventos, reuniones y momentos especiales.'}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => go('disponibilidad')}
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-clay-600 px-8 text-base font-medium text-cream-50 shadow-lift transition-all hover:bg-clay-700 active:scale-[0.98]"
            >
              Consultar disponibilidad
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => go('galeria')}
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-cream-50/30 bg-cream-50/10 px-8 text-base font-medium text-cream-50 backdrop-blur-sm transition-all hover:bg-cream-50/20 active:scale-[0.98]"
            >
              <Images className="size-4" />
              Ver galería
            </button>
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-cream-50/15 pt-7">
            {[
              { icon: Users, label: 'Capacidad', value: `Hasta ${ranch?.capacity ?? 120} personas` },
              {
                icon: MapPin,
                label: 'Modalidad',
                value: 'Alquiler del lugar completo',
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="size-5 text-gold-500" strokeWidth={1.5} />
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-cream-50/50">{label}</dt>
                  <dd className="text-sm font-medium text-cream-50">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
