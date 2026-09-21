import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-clay-600', className)} />
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton h-4 w-full', className)} />
}

/** Filas fantasma con la misma altura que la tabla real, para evitar saltos. */
export function SkeletonRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-forest-900/6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          {Array.from({ length: cols }).map((__, j) => (
            <Skeleton key={j} className={j === 0 ? 'h-4 w-40' : 'h-4 flex-1'} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      {icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-sand-100 text-moss-600">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg text-forest-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-stone-600">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      title="No pudimos cargar la información"
      description={message ?? 'Revisá tu conexión e intentá de nuevo.'}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-medium text-cream-50 transition hover:bg-forest-900"
          >
            Reintentar
          </button>
        )
      }
    />
  )
}
