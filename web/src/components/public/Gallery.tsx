import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import type { GalleryImage } from '@/types'

/**
 * Mosaico editorial: la primera imagen ocupa el doble de espacio para
 * romper la retícula y que la galería no se sienta un grid genérico.
 * Al abrir una imagen se puede navegar con flechas y teclado.
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
    <section id="galeria" className="section-y scroll-mt-24 bg-sand-100">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Galería</p>
            <h2 className="mt-4 font-display text-3xl leading-tight text-forest-900 sm:text-4xl lg:text-5xl">
              Conocé el lugar antes de venir
            </h2>
          </div>

          {categories.length > 2 && (
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setFilter(category)
                    setOpenIndex(null)
                  }}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-xs font-medium transition-colors first-letter:uppercase',
                    filter === category
                      ? 'border-forest-800 bg-forest-800 text-cream-50'
                      : 'border-forest-900/12 text-forest-800 hover:border-forest-900/30',
                  )}
                >
                  {category.replace(/-/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 grid auto-rows-[190px] grid-cols-2 gap-3 sm:auto-rows-[220px] lg:grid-cols-4 lg:gap-4">
          {visible.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setOpenIndex(index)}
              className={cn(
                'group relative overflow-hidden rounded-xl2 bg-sand-200 shadow-soft transition-shadow hover:shadow-lift',
                index === 0 && 'col-span-2 row-span-2',
              )}
            >
              <img
                src={image.url}
                alt={image.alt ?? image.title ?? 'Fotografía del rancho'}
                loading={index < 3 ? 'eager' : 'lazy'}
                className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-linear-to-t from-bark-950/75 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-cream-50/90 text-forest-900 opacity-0 transition-opacity group-hover:opacity-100">
                <Expand className="size-3.5" />
              </span>

              {image.title && (
                <span className="absolute inset-x-0 bottom-0 translate-y-2 p-4 text-left text-sm font-medium text-cream-50 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  {image.title}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Modal open={current !== null} onClose={() => setOpenIndex(null)} bare>
        {current && (
          <figure className="relative">
            <img
              src={current.url}
              alt={current.alt ?? current.title ?? ''}
              className="max-h-[78vh] w-full rounded-xl2 object-contain"
            />

            <figcaption className="mt-4 flex items-center justify-between gap-4 text-cream-50">
              <div className="min-w-0">
                <p className="font-display text-lg">{current.title}</p>
                {current.caption && <p className="text-sm text-cream-50/70">{current.caption}</p>}
              </div>
              <p className="shrink-0 text-sm text-cream-50/60">
                {(openIndex ?? 0) + 1} / {visible.length}
              </p>
            </figcaption>

            {visible.length > 1 && (
              <>
                {[
                  { dir: -1, Icon: ChevronLeft, side: 'left-3', label: 'Anterior' },
                  { dir: 1, Icon: ChevronRight, side: 'right-3', label: 'Siguiente' },
                ].map(({ dir, Icon, side, label }) => (
                  <button
                    key={label}
                    aria-label={label}
                    onClick={() => move(dir)}
                    className={cn(
                      'absolute top-1/2 -translate-y-1/2 rounded-full bg-cream-50/90 p-2.5 text-forest-900 shadow-lift transition hover:bg-cream-50',
                      side,
                    )}
                  >
                    <Icon className="size-5" />
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
