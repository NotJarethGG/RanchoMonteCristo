import type { ReactNode } from 'react'
import { Languages } from 'lucide-react'

/**
 * Bloque «En inglés» de los formularios del panel. Lo que se deje vacío se
 * muestra en español en la versión en inglés del sitio (/en).
 */
export function EnIngles({ children }: { children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-forest-900/10 bg-sand-100/50 p-4">
      <legend className="flex items-center gap-1.5 px-1 text-sm font-medium text-forest-800">
        <Languages className="size-4 text-stone-600" aria-hidden="true" />
        En inglés <span className="font-normal text-stone-600">(opcional)</span>
      </legend>
      {children}
    </fieldset>
  )
}

/** Texto recortado o `null`, para no guardar traducciones vacías. */
export const textoOpcional = (value: string) => value.trim() || null
