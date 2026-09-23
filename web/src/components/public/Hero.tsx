import { useState } from 'react'
import { Greca } from '@/components/brand/Greca'
import { cn } from '@/lib/cn'
import { coordenadas, whatsappLink } from '@/lib/format'
import { imageSrcSet, imageUrl } from '@/lib/image'
import type { GalleryImage, Ranch } from '@/types'

const FALLBACK =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80'

// Mismos valores que tiene la base: se muestran mientras responde la API para
// que el titular pinte de inmediato (es el elemento del LCP).
const DEFAULT_TAGLINE = 'Un rancho entero, solo para tu gente.'
const DEFAULT_DESCRIPTION =
  'Alquilamos el Rancho Montecristo completo para cumpleaños, bodas, reuniones familiares y paseos. Ese día no hay otros grupos: el lugar es de ustedes.'

interface HeroProps {
  ranch?: Ranch
  cover?: GalleryImage
  /** Sin datos todavía: se pinta todo menos la foto. */
  loading?: boolean
}

/**
 * Foto a sangre con el titular encima, abajo a la izquierda. El velo es
 * responsivo: parejo en móvil, donde el texto ocupa todo el ancho, y en
 * degradado horizontal desde `sm`, para que la mitad derecha de la foto se
 * vea limpia.
 */
export function Hero({ ranch, cover, loading = false }: HeroProps) {
  const [imageReady, setImageReady] = useState(false)
  const image = loading ? null : (cover?.url ?? ranch?.hero_image ?? FALLBACK)
  const lugar = ranch
    ? [ranch.location.city, ranch.location.province].filter(Boolean).join(' · ')
    : 'Nicoya · Guanacaste'
  const coords = ranch ? coordenadas(ranch.location.latitude, ranch.location.longitude) : null

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section>
      <div className="relative flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-forest-900 lg:min-h-[calc(100svh-5rem)]">
        {/* El titular va a la izquierda: el zoom anclado a la izquierda corre
            la foto hacia la derecha para que su motivo no quede detrás. */}
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
              'absolute inset-0 size-full origin-left object-cover transition-opacity duration-700 lg:scale-110',
              imageReady ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}

        <div className="absolute inset-0 bg-bark-950/72 sm:bg-transparent sm:bg-linear-to-r sm:from-bark-950/92 sm:via-bark-950/60 sm:to-bark-950/15" />
        <div className="absolute inset-0 bg-linear-to-t from-bark-950/85 via-bark-950/20 to-bark-950/45 sm:via-transparent sm:to-bark-950/40" />

        {/* Pie de foto con coordenadas, como la etiqueta de una foto de archivo. */}
        {(cover?.title || coords) && (
          <p className="rotulo absolute top-5 right-5 hidden max-w-[55%] text-right text-cream-50/80 sm:block">
            {[cover?.title, coords].filter(Boolean).join('  ·  ')}
          </p>
        )}

        <div className="container-page relative w-full pt-28 pb-14 sm:pb-20 lg:pb-24">
          <div className="max-w-3xl">
            <p className="rotulo text-gold-500">{lugar} · Costa Rica</p>

            <h1 className="mt-5 font-display text-[2.75rem] leading-[0.95] font-bold text-cream-50 sm:text-6xl lg:text-7xl">
              {ranch?.tagline ?? DEFAULT_TAGLINE}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream-50/85">
              {ranch?.description ?? DEFAULT_DESCRIPTION}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <button onClick={() => go('disponibilidad')} className="boton">
                Ver fechas libres
              </button>
              {ranch?.contact.whatsapp && (
                <a
                  href={whatsappLink(ranch.contact.whatsapp, 'Hola, quisiera consultar por una fecha en el rancho.')}
                  target="_blank"
                  rel="noreferrer"
                  className="enlace text-cream-50 decoration-gold-500"
                >
                  o escribinos al {ranch.contact.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <Greca />
    </section>
  )
}
