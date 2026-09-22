import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useIsScrolled, useScrollSpy } from '@/hooks/useScrollSpy'
import { telLink } from '@/lib/format'
import type { Ranch } from '@/types'

const LINKS = [
  { id: 'sobre-el-rancho', label: 'El rancho' },
  { id: 'galeria', label: 'Galería' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'disponibilidad', label: 'Disponibilidad' },
  { id: 'ubicacion', label: 'Ubicación' },
]

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
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'border-b border-forest-900/8 bg-cream-50/90 py-2.5 backdrop-blur-xl'
          : 'border-b border-transparent py-5',
      )}
    >
      <nav className="container-page flex items-center justify-between gap-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 text-left"
        >
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-xl transition-colors',
              scrolled ? 'bg-forest-800 text-gold-500' : 'bg-cream-50/15 text-cream-50 backdrop-blur-sm',
            )}
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
              <path d="M2 12 12 4l10 8v8a1 1 0 0 1-1 1h-6v-6H9v6H3a1 1 0 0 1-1-1z" />
            </svg>
          </span>
          <span
            className={cn(
              'font-display text-lg leading-tight transition-colors',
              scrolled ? 'text-forest-900' : 'text-cream-50',
            )}
          >
            {ranch?.name ?? 'Rancho Monte Cristo'}
          </span>
        </button>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => go(link.id)}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  scrolled ? 'text-forest-800 hover:bg-forest-900/6' : 'text-cream-50/85 hover:text-cream-50',
                  active === link.id && (scrolled ? 'text-clay-600' : 'text-gold-500'),
                )}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          {ranch?.contact.phone && (
            <a
              href={telLink(ranch.contact.phone)}
              className={cn(
                'inline-flex items-center gap-2 text-sm font-medium transition-colors',
                scrolled ? 'text-forest-800 hover:text-clay-600' : 'text-cream-50/85 hover:text-cream-50',
              )}
            >
              <Phone className="size-4" />
              {ranch.contact.phone}
            </a>
          )}
          <button
            onClick={() => go('reservar')}
            className="rounded-full bg-clay-600 px-5 py-2.5 text-sm font-medium text-cream-50 shadow-soft transition-all hover:bg-clay-700 hover:shadow-lift active:scale-[0.98]"
          >
            Reservar
          </button>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className={cn(
            'rounded-full p-2 transition-colors lg:hidden',
            scrolled ? 'text-forest-900 hover:bg-forest-900/6' : 'text-cream-50 hover:bg-cream-50/15',
          )}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {open && (
        <div className="container-page mt-3 animate-fade-in lg:hidden">
          <div className="overflow-hidden rounded-xl2 border border-forest-900/8 bg-cream-50 shadow-lift">
            <ul className="divide-y divide-forest-900/6">
              {LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => go(link.id)}
                    className="w-full px-5 py-3.5 text-left text-sm font-medium text-forest-800 transition-colors hover:bg-sand-100"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-forest-900/6 p-4">
              <button
                onClick={() => go('reservar')}
                className="w-full rounded-full bg-clay-600 py-3 text-sm font-medium text-cream-50"
              >
                Solicitar reserva
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
