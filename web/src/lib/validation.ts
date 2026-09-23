import { z } from 'zod'

/*
 * Zod v4 compila sus validaciones con `new Function()` para ganar velocidad.
 * La Content-Security-Policy del sitio prohíbe `eval` (a propósito), así que
 * ese intento fallaba: zod caía a su modo interpretado y funcionaba igual,
 * pero el navegador registraba una violación de CSP en cada visita.
 *
 * Todo el código importa `z` desde acá para que la configuración se aplique
 * antes de definir cualquier esquema.
 */
z.config({ jitless: true })

export { z }
