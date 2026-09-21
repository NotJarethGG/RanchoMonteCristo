import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 lg:mb-8">
      <div>
        <h1 className="font-display text-2xl text-forest-900 lg:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-stone-600">{description}</p>}
      </div>
      {action}
    </div>
  )
}
