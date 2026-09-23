import { lazy, Suspense, useState } from 'react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { Hero } from '@/components/public/Hero'
import { About } from '@/components/public/About'
import { Gallery } from '@/components/public/Gallery'
import { Services } from '@/components/public/Services'
import { Availability } from '@/components/public/Availability'
import { Location } from '@/components/public/Location'
import { Testimonials } from '@/components/public/Testimonials'
import { FinalCta } from '@/components/public/FinalCta'
import { WhatsappFab } from '@/components/public/WhatsappFab'
import { StructuredData } from '@/components/public/StructuredData'
import { ErrorState, Spinner } from '@/components/ui/States'
import { useLanding } from '@/hooks/usePublicData'
import { normalizeError } from '@/lib/api'

// El formulario está a mitad de página y arrastra react-hook-form + zod
// (~36 KB comprimidos). Se carga aparte para no demorar el primer pintado.
const BookingForm = lazy(() =>
  import('@/components/public/BookingForm').then((m) => ({ default: m.BookingForm })),
)

/** Reserva el espacio y el ancla `#reservar` mientras llega el formulario. */
function BookingFormPlaceholder() {
  return (
    <section id="reservar" className="scroll-mt-20 bg-cream-50 py-20 lg:py-28">
      <div className="container-page flex min-h-[40rem] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    </section>
  )
}

export default function HomePage() {
  // La fecha elegida en el calendario viaja hasta el formulario de reserva.
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [guests, setGuests] = useState(40)
  const { data, isError, error, refetch } = useLanding()

  if (isError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream-50">
        <ErrorState message={normalizeError(error).message} onRetry={() => refetch()} />
      </div>
    )
  }

  const gallery = data?.gallery ?? []
  const cover = gallery.find((image) => image.is_featured) ?? gallery[0]
  // El cierre pide una toma amplia, no un primer plano: se prefiere paisaje.
  const closing =
    gallery.find((image) => image.category === 'areas-verdes') ?? gallery[gallery.length - 1]

  const goToForm = () =>
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-dvh bg-cream-50 text-forest-900">
      <PublicNavbar ranch={data?.ranch} />

      <main>
        {/* El hero se pinta desde el primer momento, aun sin datos: con el
            plan gratuito de Render la API puede tardar en despertar, y es
            mejor que el visitante vea la marca que un spinner. */}
        <Hero ranch={data?.ranch} cover={cover} loading={!data} />

        {data ? (
          <>
            <About ranch={data.ranch} />
            <Gallery images={gallery} />
            <Services services={data.services} />
            <Availability
              ranch={data.ranch}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              guests={guests}
              onGuestsChange={setGuests}
              onContinue={goToForm}
            />
            <Suspense fallback={<BookingFormPlaceholder />}>
              <BookingForm ranch={data.ranch} selectedDate={selectedDate} guests={guests} />
            </Suspense>
            <Location ranch={data.ranch} />
            <Testimonials testimonials={data.testimonials} />
            <FinalCta ranch={data.ranch} image={closing} />
          </>
        ) : (
          <div className="flex justify-center bg-cream-50 py-24" role="status" aria-label="Cargando">
            <Spinner className="size-6" />
          </div>
        )}
      </main>

      {data && (
        <>
          <PublicFooter ranch={data.ranch} />
          <WhatsappFab phone={data.ranch.contact.whatsapp} />
          <StructuredData ranch={data.ranch} gallery={gallery} services={data.services} />
        </>
      )}
    </div>
  )
}
