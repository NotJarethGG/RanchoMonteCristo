import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Pagination({
  page,
  lastPage,
  total,
  onChange,
}: {
  page: number
  lastPage: number
  total: number
  onChange: (page: number) => void
}) {
  if (lastPage <= 1) return null

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forest-900/8 px-5 py-3.5">
      <p className="text-xs text-stone-600">
        Página {page} de {lastPage} · {total} registros
      </p>
      <div className="flex gap-2">
        {[
          { label: 'Anterior', icon: <ChevronLeft className="size-4" />, to: page - 1, disabled: page <= 1 },
          { label: 'Siguiente', icon: <ChevronRight className="size-4" />, to: page + 1, disabled: page >= lastPage },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => onChange(btn.to)}
            disabled={btn.disabled}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border border-forest-900/12 px-3.5 py-1.5 text-xs font-medium',
              'transition-colors hover:bg-forest-900/5 disabled:pointer-events-none disabled:opacity-40',
            )}
          >
            {btn.label === 'Anterior' && btn.icon}
            {btn.label}
            {btn.label === 'Siguiente' && btn.icon}
          </button>
        ))}
      </div>
    </div>
  )
}
