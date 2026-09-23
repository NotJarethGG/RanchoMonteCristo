import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { whatsappLink } from '@/lib/format'
import { useIsScrolled } from '@/hooks/useScrollSpy'
import { cn } from '@/lib/cn'

/**
 * Acceso directo a WhatsApp que aparece al bajar del hero. Una etiqueta con
 * texto, no el círculo verde de siempre: dice qué hace sin que haya que
 * reconocer el ícono.
 */
export function WhatsappFab({ phone }: { phone?: string | null }) {
  const bajoElHero = useIsScrolled(500)
  const [enElCierre, setEnElCierre] = useState(false)

  useEffect(() => {
    const onScroll = () =>
      setEnElCierre(window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 900)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const visible = bajoElHero && !enElCierre
  if (!phone) return null

  return (
    <a
      href={whatsappLink(phone, 'Hola, quisiera consultar por una fecha en el rancho.')}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'fixed right-3 bottom-3 z-30 flex items-center gap-2 border border-cream-50/20 bg-forest-900 px-3 py-2 rounded-lg font-display text-base font-bold tracking-wide text-cream-50 uppercase shadow-lift transition-all duration-300 hover:-translate-y-0.5 sm:right-6 sm:bottom-6 sm:px-4 sm:py-3 sm:text-lg',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <MessageCircle className="size-4 sm:size-5" aria-hidden="true" />
      WhatsApp
    </a>
  )
}
