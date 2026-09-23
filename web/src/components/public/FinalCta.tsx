import { ArrowRight, MessageCircle } from 'lucide-react'
import { whatsappLink } from '@/lib/format'
import { imageSrcSet, imageUrl } from '@/lib/image'
import type { GalleryImage, Ranch } from '@/types'

export function FinalCta({ ranch, image }: { ranch?: Ranch; image?: GalleryImage }) {
  const background =
    image?.url ??
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2000&q=80'

  return (
    <section className="relative overflow-hidden">
      <img
        src={imageUrl(background, 1920)}
        srcSet={imageSrcSet(background, [640, 1280, 1920])}
        sizes="100vw"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-bark-950/75" />

      <div className="container-page relative py-24 text-center sm:py-32">
        <h2 className="mx-auto max-w-3xl font-display text-4xl leading-[1.1] text-cream-50 sm:text-5xl lg:text-6xl">
          ¿Listo para disfrutar del rancho?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-cream-50/75 sm:text-lg">
          Contanos la fecha que tenés en mente y coordinamos todo para que solo te ocupés de
          disfrutar.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={() =>
              document.getElementById('disponibilidad')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-clay-600 px-8 text-base font-medium text-cream-50 shadow-lift transition-all hover:bg-clay-700 active:scale-[0.98] sm:w-auto"
          >
            Consultar disponibilidad
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          {ranch?.contact.whatsapp && (
            <a
              href={whatsappLink(
                ranch.contact.whatsapp,
                'Hola, quisiera consultar la disponibilidad del rancho.',
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full border border-cream-50/30 bg-cream-50/10 px-8 text-base font-medium text-cream-50 backdrop-blur-sm transition-all hover:bg-cream-50/20 active:scale-[0.98] sm:w-auto"
            >
              <MessageCircle className="size-4" />
              Escribir por WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
