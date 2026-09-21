import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/components/ui/States'

type Tone = 'forest' | 'clay' | 'gold' | 'ok' | 'warn' | 'danger'

const tones: Record<Tone, string> = {
  forest: 'bg-sage-100 text-forest-700',
  clay: 'bg-clay-100 text-clay-700',
  gold: 'bg-gold-100 text-gold-600',
  ok: 'bg-ok-100 text-ok-600',
  warn: 'bg-warn-100 text-warn-600',
  danger: 'bg-danger-100 text-danger-600',
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'forest',
  loading,
}: {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  tone?: Tone
  loading?: boolean
}) {
  return (
    <div className="rounded-xl2 border border-forest-900/8 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-stone-600">{label}</p>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
          <Icon className="size-4.5" strokeWidth={1.5} />
        </span>
      </div>

      {loading ? (
        <Skeleton className="mt-4 h-8 w-24" />
      ) : (
        <p className="mt-3 font-display text-3xl leading-none text-forest-900 tabular-nums">{value}</p>
      )}

      {hint && <p className="mt-2 text-xs text-stone-600">{hint}</p>}
    </div>
  )
}
