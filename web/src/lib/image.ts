/*
 * Las fotos viven en Cloudinary (las que sube el propietario) o en Unsplash
 * (las de ejemplo). Ambos servicios redimensionan y cambian de formato por URL,
 * así que se pide cada imagen al ancho en que se va a mostrar, en AVIF/WebP
 * cuando el navegador lo soporta. Cualquier otra URL se devuelve intacta.
 */

const CLOUDINARY = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/
const UNSPLASH = 'https://images.unsplash.com/'

export function imageUrl(url: string, width: number): string {
  const cloudinary = url.match(CLOUDINARY)
  if (cloudinary) {
    // f_auto elige AVIF/WebP según el navegador; c_limit nunca agranda.
    return `${cloudinary[1]}f_auto,q_auto,c_limit,w_${width}/${cloudinary[2]}`
  }

  if (url.startsWith(UNSPLASH)) {
    const u = new URL(url)
    u.searchParams.set('w', String(width))
    u.searchParams.set('auto', 'format')
    u.searchParams.set('q', '70')
    return u.toString()
  }

  return url
}

/** `srcset` con varios anchos, o undefined si la URL no es transformable. */
export function imageSrcSet(url: string, widths: number[]): string | undefined {
  if (!CLOUDINARY.test(url) && !url.startsWith(UNSPLASH)) return undefined
  return widths.map((w) => `${imageUrl(url, w)} ${w}w`).join(', ')
}
