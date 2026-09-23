import { forwardRef } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'

const control =
  'w-full rounded-xl border border-forest-900/12 bg-white px-4 py-2.5 text-sm text-forest-900 ' +
  'placeholder:text-stone-600/50 transition-colors ' +
  'focus:border-clay-500 focus:ring-4 focus:ring-clay-500/10 focus:outline-none ' +
  'disabled:bg-sand-100 disabled:text-stone-600'

const invalid = 'border-danger-600/50 focus:border-danger-600 focus:ring-danger-600/10'

export function Field({
  label,
  error,
  hint,
  required,
  htmlFor,
  className,
  labelClassName,
  children,
}: {
  label?: string
  error?: string
  hint?: ReactNode
  required?: boolean
  htmlFor?: string
  className?: string
  /** Para variar el estilo de la etiqueta (el sitio público usa el suyo). */
  labelClassName?: string
  children: ReactNode
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-forest-800', labelClassName)}>
          {label}
          {required && <span className="ml-0.5 text-clay-600">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-stone-600">{hint}</p>
      )}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid: isInvalid, ...props }, ref) {
    return <input ref={ref} className={cn(control, isInvalid && invalid, className)} {...props} />
  },
)

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid: isInvalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(control, 'min-h-28 resize-y', isInvalid && invalid, className)}
      {...props}
    />
  )
})

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid: isInvalid, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(control, 'appearance-none bg-no-repeat pr-10', isInvalid && invalid, className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' stroke='%234c463c' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 0.85rem center',
        backgroundSize: '1rem',
      }}
      {...props}
    />
  )
})

export function Switch({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
  id?: string
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          checked ? 'bg-ok-600' : 'bg-sand-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          )}
        />
      </button>
      {label && <span className="text-sm text-forest-800">{label}</span>}
    </label>
  )
}
