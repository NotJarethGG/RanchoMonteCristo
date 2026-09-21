import { MessageCircle } from 'lucide-react'
import { whatsappLink } from '@/lib/format'
import { useIsScrolled } from '@/hooks/useScrollSpy'
import { cn } from '@/lib/cn'

/** Acceso rápido que aparece cuando el visitante ya bajó del hero. */
export function WhatsappFab({ phone }: { phone?: string | null }) {
  const visible = useIsScrolled(500)
  if (!phone) return null

  return (
    <a
      href={whatsappLink(phone, 'Hola, quisiera consultar por una fecha en el rancho.')}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribir por WhatsApp"
      className={cn(
        'fixed bottom-5 right-5 z-30 flex size-13 items-center justify-center rounded-full bg-ok-600 text-white shadow-lift transition-all duration-300 hover:brightness-110',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <MessageCircle className="size-6" />
    </a>
  )
}
