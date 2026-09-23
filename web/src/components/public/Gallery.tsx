import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { imageSrcSet, imageUrl } from '@/lib/image'
import type { GalleryImage } from '@/types'

/** Las categorías se guardan como slug; acá se muestran con tildes. */
const NOMBRES: Record<string, string> = {
  'areas-verdes': 'Áreas verdes',
  rancho: 'Rancho',
  eventos: 'Eventos',
  parrilla: 'Parrilla',
  cocina: 'Cocina',
}
const nombre = (slug: string) =>
  NOMBRES[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')

/*
 * Composición en ciclos de cinco fotos sobre 12 columnas: una grande con una
 * cuadrada al lado, y debajo tres iguales. Las proporciones están elegidas
 * para que las dos de arriba queden casi a la misma altura.
 */
const DISPOSICION = [
  { span: 'lg:col-span-7', aspecto: 'aspect-[4/3]', ancho: '(min-width: 1024px) 58vw, 100vw', anchos: [640, 960, 1280] },
  { span: 'lg:col-span-5', aspecto: 'aspect-square', ancho: '(min-width: 1024px) 42vw, 50vw', anchos: [480, 800, 1000] },
  { span: 'lg:col-span-4', aspecto: 'aspect-[4/3]', ancho: '(min-width: 1024px) 33vw, 50vw', anchos: [400, 640, 800] },
  { span: 'lg:col-span-4', aspecto: 'aspect-[4/3]', ancho: '(min-width: 1024px) 33vw, 50vw', anchos: [400, 640, 800] },
  { span: 'lg:col-span-4', aspecto: 'aspect-[4/3]', ancho: '(min-width: 1024px) 33vw, 50vw', anchos: [400, 640, 800] },
]

/**
 * Álbum impreso: cada foto con su pie numerado siempre visible, en lugar de
 * títulos que aparecen al pasar el mouse (que en el celular nunca se ven).
 */
export function Gallery({ images = [] }: { images?: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>('todas')

  const categories = useMemo(() => {
    const unique = new Set(images.map((image) => image.category).filter(Boolean) as string[])
    return ['todas', ...unique]
  }, [images])

  const visible = useMemo(
    () => (filter === 'todas' ? images : images.filter((image) => image.category === filter)),
    [images, filter],
  )

  const current = openIndex !== null ? visible[openIndex] : null
  const move = (delta: number) =>
    setOpenIndex((index) =>
      index === null ? null : (index + delta + visible.length) % visible.length,
    )

  if (!images.length) return null

  return (
    <section id="galeria" className="scroll-mt-20 bg-gris-50 py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">Así se ve</h2>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4">
          {categories.length > 2 && (
            <ul className="flex flex-wrap items-baseline gap-x-1 gap-y-2 text-[15px]" aria-label="Filtrar fotos">
              {categories.map((category, index) => (
                <li key={category} className="flex items-baseline">
                  {index > 0 && <span aria-hidden="true" className="mx-2 text-forest-900/30">/</span>}
                  <button
                    onClick={() => {
                      setFilter(category)
                      setOpenIndex(null)
                    }}
                    aria-pressed={filter === category}
                    className={cn(
                      'font-medium text-forest-900 underline-offset-4 hover:text-moss-600',
                      filter === category && 'underline decoration-gold-500 decoration-2',
                    )}
                  >
                    {category === 'todas' ? 'Todas' : nombre(category)}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="rotulo text-stone-600">Tocá una foto para verla en grande</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-12">
          {visible.map((image, index) => {
            const d = DISPOSICION[index % DISPOSICION.length]
            return (
              <figure key={image.id} className={cn(index % 5 === 0 ? 'col-span-2' : 'col-span-1', d.span)}>
                <button
                  onClick={() => setOpenIndex(index)}
                  aria-label={`Ampliar foto: ${image.title ?? image.alt ?? 'rancho'}`}
                  className={cn('group block w-full overflow-hidden rounded-xl bg-forest-900 shadow-soft transition-shadow hover:shadow-lift', d.aspecto)}
                >
                  <img
                    src={imageUrl(image.url, d.anchos[1])}
                    srcSet={imageSrcSet(image.url, d.anchos)}
                    sizes={d.ancho}
                    alt={image.alt ?? image.title ?? 'Fotografía del rancho'}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="size-full object-cover transition-[filter] duration-300 group-hover:brightness-110"
                  />
                </button>
                {image.title && (
                  <figcaption className="mt-3 flex items-baseline gap-3 text-sm text-forest-900">
                    <span className="font-mono text-moss-600">{String(index + 1).padStart(2, '0')}</span>
                    <span>{image.title}</span>
                  </figcaption>
                )}
              </figure>
            )
          })}
        </div>
      </div>

      <Modal open={current !== null} onClose={() => setOpenIndex(null)} bare>
        {current && (
          <figure className="relative">
            <img
              src={imageUrl(current.url, 1600)}
              srcSet={imageSrcSet(current.url, [960, 1600, 2400])}
              sizes="(min-width: 1152px) 1152px, 100vw"
              alt={current.alt ?? current.title ?? ''}
              className="max-h-[78vh] w-full rounded-xl object-contain"
            />

            <figcaption className="mt-4 flex items-baseline justify-between gap-4 text-cream-50">
              <p className="flex items-baseline gap-3">
                <span className="font-mono text-gold-500">{String((openIndex ?? 0) + 1).padStart(2, '0')}</span>
                <span className="font-display text-xl font-bold">{current.title}</span>
              </p>
              <p className="rotulo shrink-0 text-cream-50/70">
                {(openIndex ?? 0) + 1} de {visible.length}
              </p>
            </figcaption>

            {visible.length > 1 && (
              <>
                {[
                  { dir: -1, Icon: ChevronLeft, side: 'left-3', label: 'Foto anterior' },
                  { dir: 1, Icon: ChevronRight, side: 'right-3', label: 'Foto siguiente' },
                ].map(({ dir, Icon, side, label }) => (
                  <button
                    key={label}
                    aria-label={label}
                    onClick={() => move(dir)}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 rounded-full bg-cream-50/95 p-2.5 text-forest-900 shadow-lift transition hover:bg-cream-50',
                      side,
                    )}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </button>
                ))}
              </>
            )}
          </figure>
        )}
      </Modal>
    </section>
  )
}
