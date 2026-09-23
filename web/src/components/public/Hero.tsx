import { useState } from 'react'
import { ArrowRight, Images, MapPin, Users } from 'lucide-react'
import { cn } from '@/lib/cn'
import { imageSrcSet, imageUrl } from '@/lib/image'
import type { GalleryImage, Ranch } from '@/types'

const FALLBACK =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80'

const DEFAULT_TAGLINE = 'Un lugar para crear momentos inolvidables'
const DEFAULT_DESCRIPTION =
  'Disfrutá de nuestro rancho para tus eventos, reuniones y momentos especiales.'

interface HeroProps {
  ranch?: Ranch
  cover?: GalleryImage
  /**
   * Mientras la API responde, el hero se pinta igual: marca, llamados a la
   * acción y espacio reservado para el texto. Así el visitante no mira un
   * spinner (en el plan gratuito de Render el primer arranque tarda), y no
   * hay salto de contenido cuando llegan los datos reales.
   */
  loading?: boolean
}

/**
 * El hero le da todo el protagonismo a la fotografía: imagen a sangre,
 * degradado oscuro para garantizar contraste del texto y un par de datos
 * duros (capacidad / modalidad) que responden la primera pregunta del visitante.
 */
export function Hero({ ranch, cover, loading = false }: HeroProps) {
  const [imageReady, setImageReady] = useState(false)
  const image = loading ? null : (cover?.url ?? ranch?.hero_image ?? FALLBACK)
  const place = [ranch?.location.city, ranch?.location.province].filter(Boolean).join(', ')

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="relative flex min-h-[92svh] items-end overflow-hidden bg-bark-950">
      {/* El titular se alinea a la izquierda, así que la foto se corre hacia
          la derecha para que su motivo no quede detrás del texto. El zoom
          anclado a la izquierda es lo que genera ese margen: con `object-cover`
          a secas la imagen calza justo y `object-position` no tiene efecto. */}
      {image && (
        <img
          src={imageUrl(image, 1920)}
          srcSet={imageSrcSet(image, [640, 960, 1280, 1920, 2560])}
          sizes="100vw"
          alt={cover?.alt ?? 'Vista del rancho'}
          fetchPriority="high"
          decoding="async"
          ref={(el) => {
            // Si viene de caché, `onLoad` puede dispararse antes de enganchar.
            if (el?.complete) setImageReady(true)
          }}
          onLoad={() => setImageReady(true)}
          className={cn(
            'absolute inset-0 size-full origin-left scale-100 object-cover object-center transition-opacity duration-700 lg:scale-110',
            imageReady ? 'opacity-100' : 'opacity-0',
          )}
        />
      )}

      {/* El velo es responsivo. En móvil el texto ocupa todo el ancho, así que
          se usa una capa pareja; desde `sm` el texto vive a la izquierda y el
          degradado horizontal le da contraste sin apagar el resto de la foto. */}
      <div className="absolute inset-0 bg-bark-950/72 sm:bg-transparent sm:bg-linear-to-r sm:from-bark-950/92 sm:via-bark-950/60 sm:to-bark-950/15" />
      <div className="absolute inset-0 bg-linear-to-t from-bark-950/85 via-bark-950/20 to-bark-950/45 sm:via-transparent sm:to-bark-950/40" />

      <div className="container-page relative w-full pb-16 pt-32 sm:pb-20 lg:pb-24">
        <div className="max-w-3xl animate-fade-up">
          {/* «Rancho para eventos» aparece siempre: dice qué es el sitio en el
              primer vistazo y aporta la palabra clave que el titular no tiene. */}
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream-50/20 bg-cream-50/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-cream-50/90 backdrop-blur-sm">
            <span className="size-1.5 rounded-full bg-gold-500" aria-hidden="true" />
            Rancho para eventos
            {place && <span className="text-cream-50/60">· {place}</span>}
          </p>

          <div className={cn('transition-opacity duration-500', loading ? 'opacity-0' : 'opacity-100')}>
            <h1 className="font-display text-4xl leading-[1.05] font-normal text-cream-50 sm:text-6xl lg:text-7xl">
              {ranch?.tagline ?? DEFAULT_TAGLINE}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream-50/80 sm:text-lg">
              {ranch?.description ?? DEFAULT_DESCRIPTION}
            </p>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => go('disponibilidad')}
              className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-clay-600 px-8 text-base font-medium text-cream-50 shadow-lift transition-all hover:bg-clay-700 active:scale-[0.98]"
            >
              Consultar disponibilidad
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
            <button
              onClick={() => go('galeria')}
              className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-cream-50/30 bg-cream-50/10 px-8 text-base font-medium text-cream-50 backdrop-blur-sm transition-all hover:bg-cream-50/20 active:scale-[0.98]"
            >
              <Images className="size-4" aria-hidden="true" />
              Ver galería
            </button>
          </div>

          <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-cream-50/15 pt-7">
            {[
              { icon: Users, label: 'Capacidad', value: `Hasta ${ranch?.capacity ?? 120} personas` },
              { icon: MapPin, label: 'Modalidad', value: 'Alquiler del lugar completo' },
            ].map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon className="size-5 text-gold-500" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-cream-50/60">{label}</p>
                  <p className="text-sm font-medium text-cream-50">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
