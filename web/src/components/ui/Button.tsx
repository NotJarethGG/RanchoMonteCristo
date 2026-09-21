import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'light'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap ' +
  'transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ' +
  'active:scale-[0.98]'

const variants: Record<Variant, string> = {
  primary: 'bg-clay-600 text-cream-50 hover:bg-clay-700 shadow-soft hover:shadow-lift',
  secondary: 'bg-forest-800 text-cream-50 hover:bg-forest-900 shadow-soft hover:shadow-lift',
  outline: 'border border-forest-800/20 text-forest-800 hover:bg-forest-800/5 hover:border-forest-800/35',
  ghost: 'text-forest-800 hover:bg-forest-800/6',
  danger: 'bg-danger-600 text-white hover:brightness-110 shadow-soft',
  light: 'bg-cream-50/95 text-forest-900 hover:bg-cream-50 shadow-soft hover:shadow-lift',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-8 text-base',
}

interface BaseProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
  className?: string
  children?: ReactNode
}

export interface ButtonProps
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  )
})

/** Mismo lenguaje visual para enlaces de navegación interna. */
export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: BaseProps & { to: string } & Omit<React.ComponentProps<typeof Link>, 'to' | 'className'>) {
  return (
    <Link to={to} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {icon}
      {children}
    </Link>
  )
}

/** Para enlaces externos (WhatsApp, mapas, redes). */
export function ButtonAnchor({
  variant = 'primary',
  size = 'md',
  icon,
  className,
  children,
  ...props
}: BaseProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {icon}
      {children}
    </a>
  )
}
