import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Sin padding ni chrome: útil para el lightbox de la galería. */
  bare?: boolean
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-5xl',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  bare,
}: ModalProps) {
  // Cierra con Escape y bloquea el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-bark-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 max-h-[92vh] w-full overflow-y-auto animate-scale-in',
          bare
            ? 'max-w-6xl bg-transparent'
            : cn('rounded-t-3xl bg-cream-50 shadow-lift sm:rounded-xl2', sizes[size]),
        )}
      >
        {!bare && (title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-forest-900/8 px-6 py-5">
            <div>
              {title && <h2 className="font-display text-xl text-forest-900">{title}</h2>}
              {description && <p className="mt-1 text-sm text-stone-600">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="-mr-1 rounded-full p-1.5 text-stone-600 transition-colors hover:bg-forest-900/6"
            >
              <X className="size-5" />
            </button>
          </div>
        )}

        {bare ? (
          <>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute -top-2 right-0 z-20 rounded-full bg-cream-50/90 p-2 text-forest-900 shadow-lift transition hover:bg-cream-50 sm:-top-12"
            >
              <X className="size-5" />
            </button>
            {children}
          </>
        ) : (
          <div className="px-6 py-5">{children}</div>
        )}

        {!bare && footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-forest-900/8 bg-sand-100/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

/** Confirmación reutilizable para acciones destructivas. */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  loading,
  tone = 'danger',
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmLabel?: string
  loading?: boolean
  tone?: 'danger' | 'primary'
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm leading-relaxed text-stone-700">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-forest-800 transition hover:bg-forest-900/6"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn(
            'rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-soft transition disabled:opacity-60',
            tone === 'danger' ? 'bg-danger-600 hover:brightness-110' : 'bg-clay-600 hover:bg-clay-700',
          )}
        >
          {loading ? 'Procesando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
