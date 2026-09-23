import { telLink } from '@/lib/format'
import type { GalleryImage, Ranch, Service } from '@/types'

/**
 * Datos estructurados (schema.org, JSON-LD) para buscadores.
 *
 * Es lo que le permite a Google entender que esto es un lugar físico que se
 * alquila para eventos, dónde está y cómo contactarlo, y lo que alimenta los
 * resultados locales («rancho para eventos en Nicoya»). Se arma con los datos
 * de la API, así que se mantiene al día con lo que edite el propietario.
 *
 * No se incluye `aggregateRating` a propósito: Google no admite reseñas que
 * un negocio publica sobre sí mismo en su propio sitio, y marcarlas así puede
 * acarrear una acción manual contra el dominio.
 */
export function StructuredData({
  ranch,
  gallery,
  services,
}: {
  ranch: Ranch
  gallery: GalleryImage[]
  services: Service[]
}) {
  const url = window.location.origin + '/'
  const phone = telLink(ranch.contact.phone).replace(/^tel:/, '')
  const { location } = ranch

  const data = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'EventVenue'],
    '@id': `${url}#rancho`,
    name: ranch.name,
    description: ranch.about ?? ranch.description ?? undefined,
    url,
    telephone: phone !== '#' ? phone : undefined,
    email: ranch.contact.email ?? undefined,
    image: gallery.slice(0, 6).map((image) => image.url),
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.address ?? undefined,
      addressLocality: location.city ?? undefined,
      addressRegion: location.province ?? undefined,
      addressCountry: 'CR',
    },
    geo:
      location.latitude != null && location.longitude != null
        ? { '@type': 'GeoCoordinates', latitude: location.latitude, longitude: location.longitude }
        : undefined,
    hasMap: location.google_maps_url ?? undefined,
    maximumAttendeeCapacity: ranch.capacity || undefined,
    amenityFeature: services.map((service) => ({
      '@type': 'LocationFeatureSpecification',
      name: service.name,
      value: true,
    })),
    sameAs: Object.values(ranch.socials ?? {}).filter(Boolean),
  }

  // `<` escapado: el contenido lo edita el propietario y no debe poder cerrar
  // la etiqueta <script> e inyectar HTML.
  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
