import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarDays, CreditCard, Image, LayoutDashboard, LogOut, Menu, Settings, Sparkles,
  Tags, Users, MessageSquareQuote, UserCog, X, ExternalLink,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { initials } from '@/lib/format'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

const NAV: NavItem[] = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/admin/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/admin/reservas', label: 'Reservas', icon: Tags },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/pagos', label: 'Pagos', icon: CreditCard },
]

const ADMIN_NAV: NavItem[] = [
  { to: '/admin/servicios', label: 'Servicios', icon: Sparkles },
  { to: '/admin/galeria', label: 'Galería', icon: Image },
  { to: '/admin/testimonios', label: 'Testimonios', icon: MessageSquareQuote },
  { to: '/admin/precios', label: 'Precios', icon: Tags },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
  { to: '/admin/usuarios', label: 'Usuarios', icon: UserCog },
]

/** En móvil se muestran solo las 5 secciones operativas, en barra inferior. */
const MOBILE_NAV = NAV

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth()
  const [drawer, setDrawer] = useState(false)
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    toast.success('Sesión cerrada')
  }

  const sections = [
    { title: 'Operación', items: NAV },
    ...(isAdmin ? [{ title: 'Administración', items: ADMIN_NAV }] : []),
  ]

  const sidebar = (
    <div className="flex h-full flex-col bg-forest-900 text-sage-200">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="flex size-9 items-center justify-center rounded-xl bg-gold-500/15 text-gold-500">
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
            <path d="M2 12 12 4l10 8v8a1 1 0 0 1-1 1h-6v-6H9v6H3a1 1 0 0 1-1-1z" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base text-cream-50">Montecristo</p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-sage-400">Administración</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-400/70">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={() => setDrawer(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                        isActive
                          ? 'bg-gold-500/12 font-medium text-gold-500'
                          : 'text-sage-200/80 hover:bg-cream-50/6 hover:text-cream-50',
                      )
                    }
                  >
                    <Icon className="size-4.5 shrink-0" strokeWidth={1.5} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sage-200/10 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sage-200/80 transition-colors hover:bg-cream-50/6 hover:text-cream-50"
        >
          <ExternalLink className="size-4.5 shrink-0" strokeWidth={1.5} />
          Ver el sitio
        </a>

        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-xs font-semibold text-gold-500">
            {initials(user?.name ?? '')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-cream-50">{user?.name}</p>
            <p className="truncate text-xs text-sage-400">{user?.role_label}</p>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="rounded-lg p-1.5 text-sage-400 transition-colors hover:bg-cream-50/6 hover:text-danger-600"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh bg-sand-100">
      {/* Sidebar fijo en escritorio */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">{sidebar}</aside>

      {/* Drawer en tablet/móvil */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-bark-950/60 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-in shadow-lift">
            <button
              onClick={() => setDrawer(false)}
              aria-label="Cerrar menú"
              className="absolute right-3 top-6 rounded-lg p-1.5 text-sage-300"
            >
              <X className="size-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Barra superior móvil */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-forest-900/8 bg-cream-50/90 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setDrawer(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-forest-800 transition-colors hover:bg-forest-900/6"
          >
            <Menu className="size-5" />
          </button>
          <p className="flex-1 truncate font-display text-lg text-forest-900">
            {[...NAV, ...ADMIN_NAV].find((item) => item.to === location.pathname)?.label ?? 'Panel'}
          </p>
          <span className="flex size-8 items-center justify-center rounded-full bg-forest-800 text-xs font-semibold text-gold-500">
            {initials(user?.name ?? '')}
          </span>
        </header>

        <main className="px-4 pb-24 pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          <Outlet />
        </main>
      </div>

      {/* Navegación inferior en móvil: no comprimimos la tabla de escritorio */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-forest-900/8 bg-cream-50/95 backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors',
                    isActive ? 'text-clay-600' : 'text-stone-600',
                  )
                }
              >
                <Icon className="size-5" strokeWidth={1.5} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
