import { useState } from 'react'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { Hero } from '@/components/public/Hero'
import { About } from '@/components/public/About'
import { Gallery } from '@/components/public/Gallery'
import { Services } from '@/components/public/Services'
import { Availability } from '@/components/public/Availability'
import { BookingForm } from '@/components/public/BookingForm'
import { Location } from '@/components/public/Location'
import { Testimonials } from '@/components/public/Testimonials'
import { FinalCta } from '@/components/public/FinalCta'
import { WhatsappFab } from '@/components/public/WhatsappFab'
import { ErrorState, Spinner } from '@/components/ui/States'
import { useLanding } from '@/hooks/usePublicData'

export default function HomePage() {
  // La fecha elegida en el calendario viaja hasta el formulario de reserva.
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [guests, setGuests] = useState(40)
  const { data, isLoading, isError, refetch } = useLanding()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream-50">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream-50">
        <ErrorState onRetry={() => refetch()} />
      </div>
    )
  }

  const { ranch, services, gallery, testimonials } = data
  const cover = gallery.find((image) => image.is_featured) ?? gallery[0]
  // El cierre pide una toma amplia, no un primer plano: se prefiere paisaje.
  const closing =
    gallery.find((image) => image.category === 'areas-verdes') ?? gallery[gallery.length - 1]

  const goToForm = () =>
    document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="min-h-dvh bg-cream-50">
      <PublicNavbar ranch={ranch} />

      <main>
        <Hero ranch={ranch} cover={cover} />
        <About ranch={ranch} />
        <Gallery images={gallery} />
        <Services services={services} />
        <Availability
          ranch={ranch}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          guests={guests}
          onGuestsChange={setGuests}
          onContinue={goToForm}
        />
        <BookingForm ranch={ranch} selectedDate={selectedDate} guests={guests} />
        <Location ranch={ranch} />
        <Testimonials testimonials={testimonials} />
        <FinalCta ranch={ranch} image={closing} />
      </main>

      <PublicFooter ranch={ranch} />
      <WhatsappFab phone={ranch.contact.whatsapp} />
    </div>
  )
}
