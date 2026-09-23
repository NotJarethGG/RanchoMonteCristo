import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { telLink } from '@/lib/format'
import { useIsScrolled, useScrollSpy } from '@/hooks/useScrollSpy'
import type { Ranch } from '@/types'

const LINKS = [
  { id: 'sobre-el-rancho', label: 'El lugar' },
  { id: 'galeria', label: 'Fotos' },
  { id: 'servicios', label: 'Lo que hay' },
  { id: 'disponibilidad', label: 'Fechas' },
  { id: 'ubicacion', label: 'Cómo llegar' },
]

/**
 * Franja superior sólida con el logo del rancho y el teléfono a la vista. No flota
 * transparente sobre la foto: así el hero puede mostrar la imagen limpia.
 */
export function PublicNavbar({ ranch }: { ranch?: Ranch }) {
  const [open, setOpen] = useState(false)
  const scrolled = useIsScrolled()
  const active = useScrollSpy(LINKS.map((link) => link.id))

  const go = (id: string) => {
    setOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-forest-900/10 bg-white/95 backdrop-blur-xl transition-shadow',
        scrolled && 'shadow-soft',
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-6 lg:h-20">
        {/* Logo del rancho. El alto es fijo y el ancho proporcional (437×112
            en origen), así no hay salto de diseño mientras carga. */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="shrink-0">
          <img
            src="/marca/logo-texto-oscuro.webp"
            alt={`${ranch?.name ?? 'Rancho Montecristo'}, ir al inicio`}
            width={437}
            height={112}
            className="h-10 w-auto lg:h-12"
          />
        </button>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => go(link.id)}
                className={cn(
                  'py-1 text-[15px] font-medium text-forest-900 underline-offset-[6px] transition-colors hover:text-moss-600',
                  active === link.id && 'underline decoration-gold-500 decoration-2',
                )}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-6 lg:flex">
          {ranch?.contact.phone && (
            <a href={telLink(ranch.contact.phone)} className="font-mono text-sm text-forest-900 hover:text-moss-600">
              {ranch.contact.phone}
            </a>
          )}
          <button onClick={() => go('reservar')} className="boton h-10 px-5 text-base">
            Apartar fecha
          </button>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-lg border border-forest-900/20 px-3 py-1.5 font-mono text-xs tracking-[0.15em] text-forest-900 uppercase lg:hidden"
        >
          {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
          Menú
        </button>
      </nav>

      {open && (
        <div className="border-t border-forest-900/10 bg-white lg:hidden">
          <ul className="container-page divide-y divide-forest-900/15">
            {LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => go(link.id)}
                  className="w-full py-4 text-left font-display text-2xl font-bold text-forest-900"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="container-page flex flex-col gap-3 border-t border-forest-900/10 py-5">
            <button onClick={() => go('reservar')} className="boton w-full">
              Apartar fecha
            </button>
            {ranch?.contact.phone && (
              <a href={telLink(ranch.contact.phone)} className="text-center font-mono text-sm text-forest-900">
                o llamá al {ranch.contact.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
