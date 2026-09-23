import { Greca } from '@/components/brand/Greca'
import { whatsappLink } from '@/lib/format'
import type { Ranch } from '@/types'

/**
 * Cierre en una franja terracota. El número de WhatsApp es el
 * protagonista: en Costa Rica es como la gente de verdad aparta una fecha.
 */
export function FinalCta({ ranch }: { ranch: Ranch }) {
  const go = () =>
    document.getElementById('disponibilidad')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className="bg-clay-600 text-cream-50">
      <div className="bg-forest-900">
        <Greca invertida />
      </div>

      <div className="container-page py-20 lg:py-28">
        <h2 className="max-w-4xl font-display text-5xl leading-[0.95] font-bold sm:text-6xl lg:text-7xl">
          ¿Qué fecha tenés en mente?
        </h2>

        {ranch.contact.whatsapp && (
          <div className="mt-12">
            <p className="rotulo text-cream-50">Escribinos por WhatsApp</p>
            <a
              href={whatsappLink(ranch.contact.whatsapp, 'Hola, quisiera consultar la disponibilidad del rancho.')}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block font-mono text-5xl tracking-tight text-cream-50 underline decoration-cream-50/40 decoration-2 underline-offset-8 transition-[text-decoration-color] hover:decoration-cream-50 sm:text-7xl lg:text-8xl"
            >
              {ranch.contact.phone}
            </a>
          </div>
        )}

        <p className="mt-12 text-lg text-cream-50">
          O mirá primero{' '}
          <button
            onClick={go}
            className="font-semibold text-cream-50 underline decoration-2 underline-offset-4 hover:decoration-4"
          >
            qué fechas están libres
          </button>
          .
        </p>
      </div>
    </section>
  )
}
