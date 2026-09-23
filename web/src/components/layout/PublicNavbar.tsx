import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { telLink } from '@/lib/format'
import { useIsScrolled, useScrollSpy } from '@/hooks/useScrollSpy'
import { HOME_PATH, useLang, useT, type Lang } from '@/lib/i18n'
import type { Ranch } from '@/types'

const SECCIONES = ['sobre-el-rancho', 'galeria', 'servicios', 'disponibilidad', 'ubicacion']
const IDIOMAS: Lang[] = ['es', 'en']

/**
 * ES / EN. Son enlaces a `/` y `/en`, no un botón que cambia un estado: así
 * cada versión tiene su dirección, que se puede compartir y que Google indexa.
 */
function SelectorIdioma() {
  const lang = useLang()
  const t = useT().idioma

  return (
    <div role="group" aria-label={t.grupo} className="flex items-center font-mono text-xs tracking-[0.15em] uppercase">
      {IDIOMAS.map((opcion, index) => (
        <Fragment key={opcion}>
          {index > 0 && (
            <span aria-hidden="true" className="text-forest-900/30">
              /
            </span>
          )}
          {opcion === lang ? (
            <span aria-current="true" className="inline-flex h-8 items-center px-1.5 font-semibold text-forest-900">
              <span className="underline decoration-gold-500 decoration-2 underline-offset-4" aria-hidden="true">
                {opcion}
              </span>
              <span className="sr-only">{t[opcion]}</span>
            </span>
          ) : (
            <Link
              to={HOME_PATH[opcion]}
              lang={opcion}
              hrefLang={opcion}
              aria-label={t[opcion]}
              title={t[opcion]}
              className="inline-flex h-8 items-center px-1.5 text-stone-600 transition-colors hover:text-moss-600"
            >
              {opcion}
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  )
}

/**
 * Franja superior sólida con el logo del rancho y el teléfono a la vista. No flota
 * transparente sobre la foto: así el hero puede mostrar la imagen limpia.
 */
export function PublicNavbar({ ranch }: { ranch?: Ranch }) {
  const [open, setOpen] = useState(false)
  const scrolled = useIsScrolled()
  const active = useScrollSpy(SECCIONES)
  const t = useT().nav
  const LINKS = SECCIONES.map((id) => ({ id, label: t.links[id] }))

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
            alt={`${ranch?.name ?? 'Rancho Montecristo'}, ${t.alInicio}`}
            width={437}
            height={112}
            className="h-10 w-auto lg:h-12"
          />
        </button>

        <ul className="hidden items-center gap-6 lg:flex xl:gap-7">
          {LINKS.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => go(link.id)}
                className={cn(
                  'py-1 text-[15px] font-medium whitespace-nowrap text-forest-900 underline-offset-[6px] transition-colors hover:text-moss-600',
                  active === link.id && 'underline decoration-gold-500 decoration-2',
                )}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 lg:flex">
          <SelectorIdioma />
          {ranch?.contact.phone && (
            <a href={telLink(ranch.contact.phone)} className="hidden font-mono text-sm text-forest-900 hover:text-moss-600 xl:inline">
              {ranch.contact.phone}
            </a>
          )}
          <button onClick={() => go('reservar')} className="boton h-10 px-5 text-base whitespace-nowrap">
            {t.apartar}
          </button>
        </div>

        {/* En el celular el idioma queda a la vista, sin abrir el menú. */}
        <div className="flex items-center gap-3 lg:hidden">
          <SelectorIdioma />
          <button
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? t.cerrarMenu : t.abrirMenu}
            aria-expanded={open}
            className="flex items-center gap-2 rounded-lg border border-forest-900/20 px-3 py-1.5 font-mono text-xs tracking-[0.15em] text-forest-900 uppercase"
          >
            {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            {t.menu}
          </button>
        </div>
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
              {t.apartar}
            </button>
            {ranch?.contact.phone && (
              <a href={telLink(ranch.contact.phone)} className="text-center font-mono text-sm text-forest-900">
                {t.llamar} {ranch.contact.phone}
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
