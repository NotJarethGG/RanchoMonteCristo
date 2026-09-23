import { coordenadas } from '@/lib/format'
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

/**
 * El mapa enmarcado como una hoja de carta topográfica, con las coordenadas
 * en el margen. En zona rural no hay nombres de calle: la dirección con su
 * Plus Code y el botón a Maps son lo que de verdad sirve para llegar.
 */
export function Location({ ranch }: { ranch: Ranch }) {
  const { latitude, longitude } = ranch.location
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number'
  const coords = coordenadas(latitude, longitude)
  const lugar = [ranch.location.city, ranch.location.province].filter(Boolean).join(', ')

  return (
    <section id="ubicacion" className="scroll-mt-20 bg-sand-100 py-20 lg:py-28">
      <div className="container-page">
        <h2 className="titulo-seccion">Cómo llegar</h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <figure className="overflow-hidden rounded-xl border border-forest-900/10 bg-white shadow-soft">
            <figcaption className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-forest-900/10 px-5 py-3">
              <span className="rotulo text-forest-900">{lugar}</span>
              {coords && <span className="rotulo text-stone-600">{coords}</span>}
            </figcaption>
            {hasCoords ? (
              <iframe
                title={`Mapa de la ubicación de ${ranch.name}`}
                src={mapSrc(latitude!, longitude!)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-80 w-full border-0 sm:h-[26rem]"
              />
            ) : (
              <div className="flex h-80 items-center justify-center text-sm text-stone-600">
                La ubicación todavía no está configurada.
              </div>
            )}
          </figure>

          <div className="flex flex-col gap-10">
            <div>
              <h3 className="rotulo text-stone-600">Dirección</h3>
              <p className="mt-3 font-display text-2xl leading-snug font-bold text-forest-900">
                {ranch.location.address}
              </p>
              <p className="mt-1 text-lg text-stone-600">{lugar}</p>

              {ranch.location.google_maps_url && (
                <a
                  href={ranch.location.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="boton mt-6"
                >
                  Abrir en Maps
                </a>
              )}
            </div>

            {!!ranch.schedule?.length && (
              <div>
                <h3 className="rotulo text-stone-600">Horarios</h3>
                <dl className="mt-3">
                  {ranch.schedule.map((item) => (
                    <div key={item.day} className="flex items-baseline justify-between gap-3 border-b border-forest-900/10 py-3">
                      <dt className="text-forest-900">{item.day}</dt>
                      <dd className="font-mono text-sm text-forest-900">{item.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
