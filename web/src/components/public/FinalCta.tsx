import { imageSrcSet, imageUrl } from '@/lib/image'
import { whatsappLink } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { GalleryImage, Ranch } from '@/types'

const FALLBACK =
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2000&q=80'

/**
 * Cierre sobre una foto oscurecida. El número de WhatsApp va en grande: en
 * Costa Rica es como la gente de verdad aparta una fecha.
 */
export function FinalCta({ ranch, image }: { ranch: Ranch; image?: GalleryImage }) {
  const fondo = image?.url ?? FALLBACK
  const t = useT()
  const go = () =>
    document.getElementById('disponibilidad')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="relative overflow-hidden">
      <img
        src={imageUrl(fondo, 1920)}
        srcSet={imageSrcSet(fondo, [640, 1280, 1920])}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-bark-950/78" />

      <div className="container-page relative py-24 text-center sm:py-32">
        <h2 className="mx-auto max-w-3xl font-display text-5xl leading-[0.95] font-bold text-cream-50 sm:text-6xl lg:text-7xl">
          {t.cierre.titulo}
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-cream-50/85">
          {t.cierre.intro}
        </p>

        {ranch.contact.whatsapp && (
          <div className="mt-10">
            <p className="rotulo text-gold-500">{t.cierre.whatsapp}</p>
            <a
              href={whatsappLink(ranch.contact.whatsapp, t.whatsapp.disponibilidad)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block font-mono text-5xl tracking-tight text-cream-50 underline decoration-gold-500/60 decoration-2 underline-offset-8 transition-[text-decoration-color] hover:decoration-gold-500 sm:text-7xl"
            >
              {ranch.contact.phone}
            </a>
          </div>
        )}

        <div className="mt-10">
          <button onClick={go} className="boton boton-claro">
            {t.cierre.cta}
          </button>
        </div>
      </div>
    </section>
  )
}
