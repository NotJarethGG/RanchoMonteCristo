import { Link } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { FacebookIcon, InstagramIcon, TiktokIcon } from '@/components/ui/BrandIcons'
import { whatsappLink } from '@/lib/format'
import type { Ranch } from '@/types'

export function PublicFooter({ ranch }: { ranch?: Ranch }) {
  const year = new Date().getFullYear()
  const socials = [
    { key: 'facebook', icon: FacebookIcon, label: 'Facebook' },
    { key: 'instagram', icon: InstagramIcon, label: 'Instagram' },
    { key: 'tiktok', icon: TiktokIcon, label: 'TikTok' },
  ] as const

  return (
    <footer className="bg-forest-900 text-sage-200">
      <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <h3 className="font-display text-2xl text-cream-50">{ranch?.name ?? 'Rancho Monte Cristo'}</h3>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-sage-300">
            {ranch?.description ??
              'Disfrutá de nuestro rancho para tus eventos, reuniones y momentos especiales.'}
          </p>

          <div className="mt-6 flex gap-3">
            {socials.map(({ key, icon: Icon, label }) => {
              const url = ranch?.socials?.[key]
              if (!url) return null
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-full border border-sage-200/20 p-2.5 text-sage-200 transition-colors hover:border-gold-500/50 hover:text-gold-500"
                >
                  <Icon className="size-4" />
                </a>
              )
            })}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">Contacto</h4>
          <ul className="mt-5 space-y-3.5 text-sm">
            {ranch?.contact.phone && (
              <li>
                <a
                  href={`tel:${ranch.contact.phone.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-cream-50"
                >
                  <Phone className="size-4 shrink-0 text-sage-400" />
                  {ranch.contact.phone}
                </a>
              </li>
            )}
            {ranch?.contact.whatsapp && (
              <li>
                <a
                  href={whatsappLink(ranch.contact.whatsapp, 'Hola, quisiera consultar por una fecha en el rancho.')}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 transition-colors hover:text-cream-50"
                >
                  <MessageCircle className="size-4 shrink-0 text-sage-400" />
                  WhatsApp
                </a>
              </li>
            )}
            {ranch?.contact.email && (
              <li>
                <a
                  href={`mailto:${ranch.contact.email}`}
                  className="inline-flex items-center gap-2.5 break-all transition-colors hover:text-cream-50"
                >
                  <Mail className="size-4 shrink-0 text-sage-400" />
                  {ranch.contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">Ubicación</h4>
          <p className="mt-5 flex items-start gap-2.5 text-sm leading-relaxed">
            <MapPin className="mt-0.5 size-4 shrink-0 text-sage-400" />
            <span>
              {ranch?.location.address}
              <br />
              {[ranch?.location.city, ranch?.location.province].filter(Boolean).join(', ')}
            </span>
          </p>
          {ranch?.check_in_time && ranch?.check_out_time && (
            <p className="mt-4 text-sm text-sage-300">
              Horario del evento: {ranch.check_in_time.slice(0, 5)} a {ranch.check_out_time.slice(0, 5)}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-sage-200/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-sage-400 sm:flex-row">
          <p>
            © {year} {ranch?.name ?? 'Rancho Monte Cristo'}. Todos los derechos reservados.
          </p>
          <Link to="/admin" className="transition-colors hover:text-gold-500">
            Acceso administrativo
          </Link>
        </div>
      </div>
    </footer>
  )
}
