import { useId } from 'react'
import { cn } from '@/lib/cn'

/**
 * Franja decorativa basada en las grecas escalonadas de la cerámica chorotega
 * de Guaitil: pirámides de escalones en rojo óxido entre dos líneas negras.
 * Se usa como separador en lugar de las divisiones lisas de siempre.
 */
export function Greca({ className, invertida = false }: { className?: string; invertida?: boolean }) {
  const id = useId()
  const linea = invertida ? 'var(--color-cream-50)' : 'var(--color-forest-900)'

  return (
    <svg
      aria-hidden="true"
      className={cn('block h-4 w-full', className)}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={id} width="32" height="16" patternUnits="userSpaceOnUse">
          <path
            d="M0 12 H4 V8 H8 V4 H16 V8 H20 V12 H32 V13 H0 Z"
            fill="var(--color-clay-600)"
          />
          <rect y="0" width="32" height="1.5" fill={linea} />
          <rect y="14.5" width="32" height="1.5" fill={linea} />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill={`url(#${id})`} />
    </svg>
  )
}
