import { Clock, ExternalLink, MapPin, Navigation } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { ButtonAnchor } from '@/components/ui/Button'
import type { Ranch } from '@/types'

/**
 * Mapa embebido. Si hay VITE_GOOGLE_MAPS_API_KEY se usa Google Maps Embed;
 * si no, cae en OpenStreetMap, que no requiere clave. Así el MVP funciona
 * desde el primer día y activar Google es cambiar una variable de entorno.
 */
function mapSrc(lat: number, lng: number) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (key) {
    return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${lat},${lng}&zoom=15`
  }
  const d = 0.008
  const bbox = [lng - d, lat - d / 2, lng + d, lat + d / 2].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
}

export function Location({ ranch }: { ranch?: Ranch }) {
  const { latitude, longitude } = ranch?.location ?? {}
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number'

  return (
    <section id="ubicacion" className="section-y scroll-mt-24 bg-sand-100">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Ubicación</p>
          <h2 className="mt-4 font-display text-3xl leading-tight text-forest-900 sm:text-4xl lg:text-5xl">
            Cómo llegar
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card className="overflow-hidden p-0">
            {hasCoords ? (
              <iframe
                title={`Mapa de ${ranch?.name}`}
                src={mapSrc(latitude!, longitude!)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-80 w-full border-0 sm:h-[26rem] lg:h-full lg:min-h-[26rem]"
              />
            ) : (
              <div className="flex h-80 items-center justify-center text-sm text-stone-600">
                Ubicación pendiente de configurar.
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex gap-3.5">
                <MapPin className="mt-0.5 size-5 shrink-0 text-clay-600" strokeWidth={1.5} />
                <div>
                  <h3 className="font-display text-lg text-forest-900">Dirección</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                    {ranch?.location.address}
                    <br />
                    {[ranch?.location.city, ranch?.location.province].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>

              {ranch?.location.google_maps_url && (
                <ButtonAnchor
                  href={ranch.location.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  variant="outline"
                  size="sm"
                  className="mt-5 w-full"
                  icon={<Navigation className="size-4" />}
                >
                  Abrir en Maps
                  <ExternalLink className="size-3.5 opacity-60" />
                </ButtonAnchor>
              )}
            </Card>

            {!!ranch?.schedule?.length && (
              <Card className="p-6">
                <div className="flex gap-3.5">
                  <Clock className="mt-0.5 size-5 shrink-0 text-clay-600" strokeWidth={1.5} />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg text-forest-900">Horarios</h3>
                    <ul className="mt-3 space-y-2">
                      {ranch.schedule.map((item) => (
                        <li
                          key={item.day}
                          className="flex flex-wrap justify-between gap-2 text-sm text-stone-600"
                        >
                          <span>{item.day}</span>
                          <span className="font-medium text-forest-800">{item.hours}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
