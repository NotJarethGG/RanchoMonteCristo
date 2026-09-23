import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns'
import { enUS, es } from 'date-fns/locale'

/** Locale de date-fns para cada idioma del sitio. */
const LOCALES = { es, en: enUS }
type Idioma = keyof typeof LOCALES

const currency = new Intl.NumberFormat('es-CR', {
  style: 'currency',
  currency: 'CRC',
  maximumFractionDigits: 0,
})

export const formatMoney = (value: number | string | null | undefined) =>
  currency.format(Number(value ?? 0))

/** Versión compacta para tarjetas de estadísticas: ₡1,2 M */
export function formatMoneyShort(value: number) {
  if (Math.abs(value) >= 1_000_000) return `₡${(value / 1_000_000).toFixed(1).replace('.', ',')} M`
  if (Math.abs(value) >= 1_000) return `₡${Math.round(value / 1_000)} K`
  return formatMoney(value)
}

/** Acepta 'YYYY-MM-DD' sin desplazamiento por zona horaria. */
export function toDate(value: string | Date): Date {
  if (value instanceof Date) return value
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : parseISO(value)
}

export function formatDate(
  value: string | Date | null | undefined,
  pattern = "d 'de' MMMM, yyyy",
  lang: Idioma = 'es',
) {
  if (!value) return '—'
  const date = toDate(value)
  return isValid(date) ? format(date, pattern, { locale: LOCALES[lang] }) : '—'
}

export const formatDateShort = (value: string | Date | null | undefined) =>
  formatDate(value, 'd MMM yyyy')

export const formatWeekday = (value: string | Date, lang: Idioma = 'es') =>
  formatDate(value, 'EEEE', lang)

export function formatRelative(value: string | null | undefined) {
  if (!value) return '—'
  const date = toDate(value)
  return isValid(date) ? formatDistanceToNowStrict(date, { locale: es, addSuffix: true }) : '—'
}

/** '09:00' → '9:00 a.m.' (en inglés, '9:00 AM') */
export function formatTime(value: string | null | undefined, lang: Idioma = 'es') {
  if (!value) return '—'
  const [h, m] = value.split(':').map(Number)
  const suffix = lang === 'en' ? (h < 12 ? 'AM' : 'PM') : h < 12 ? 'a.m.' : 'p.m.'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export const formatTimeRange = (start: string, end: string) =>
  `${formatTime(start)} – ${formatTime(end)}`

/**
 * Enlace para llamar. Los números de Costa Rica se guardan con 8 dígitos
 * («8934-3847»), que no sirven para marcar desde el exterior ni desde un
 * celular configurado en internacional. Se antepone el código de país cuando
 * falta; si el número ya trae uno, se respeta.
 */
export function telLink(phone: string | null | undefined) {
  if (!phone) return '#'

  const digits = phone.replace(/[^0-9+]/g, '')
  if (digits.startsWith('+')) return `tel:${digits}`

  return `tel:${digits.length === 8 ? `+506${digits}` : digits}`
}

/** '+50688881122' → 'https://wa.me/50688881122' */
export const whatsappLink = (phone: string | null | undefined, message?: string) => {
  if (!phone) return '#'
  const clean = phone.replace(/[^0-9]/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${clean}${text}`
}

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

/** 10.132288, -85.464703 → «10°07′56″ N  85°27′53″ O» (en inglés, «W») */
export function coordenadas(
  lat: number | null | undefined,
  lng: number | null | undefined,
  lang: Idioma = 'es',
) {
  if (lat == null || lng == null) return null

  const dms = (valor: number) => {
    const abs = Math.abs(valor)
    const grados = Math.floor(abs)
    const minutos = Math.floor((abs - grados) * 60)
    const segundos = Math.round(((abs - grados) * 60 - minutos) * 60)
    return `${grados}°${String(minutos).padStart(2, '0')}′${String(segundos).padStart(2, '0')}″`
  }

  const oeste = lang === 'en' ? 'W' : 'O'
  return `${dms(lat)} ${lat >= 0 ? 'N' : 'S'}  ${dms(lng)} ${lng >= 0 ? 'E' : oeste}`
}
