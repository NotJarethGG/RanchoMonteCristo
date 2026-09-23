import { Link } from 'react-router-dom'
import { FacebookIcon, InstagramIcon, TiktokIcon } from '@/components/ui/BrandIcons'
import { coordenadas, telLink, whatsappLink } from '@/lib/format'
import { direccion, useLang, useT } from '@/lib/i18n'
import type { Ranch } from '@/types'

export function PublicFooter({ ranch }: { ranch: Ranch }) {
  const year = new Date().getFullYear()
  const lang = useLang()
  const t = useT()
  const coords = coordenadas(ranch.location.latitude, ranch.location.longitude, lang)
  const socials = [
    { key: 'facebook', icon: FacebookIcon, label: 'Facebook' },
    { key: 'instagram', icon: InstagramIcon, label: 'Instagram' },
    { key: 'tiktok', icon: TiktokIcon, label: 'TikTok' },
  ] as const

  return (
    <footer className="border-t border-cream-50/15 bg-forest-900 text-cream-50">
      <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <img
            src="/marca/logo-completo.webp"
            alt={t.footer.logo(ranch.name)}
            width={560}
            height={313}
            loading="lazy"
            className="h-auto w-64 sm:w-72"
          />
          <p className="mt-6 max-w-sm leading-relaxed text-cream-50/75">
            {t.footer.resumen(ranch.location.city ?? 'Nicoya')}
          </p>

          <ul className="mt-7 flex gap-3">
            {socials.map(({ key, icon: Icon, label }) => {
              const url = ranch.socials?.[key]
              if (!url) return null
              return (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex size-10 items-center justify-center rounded-lg border border-cream-50/25 text-cream-50 transition-colors hover:border-gold-500 hover:text-gold-500"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div>
          <h3 className="rotulo text-gold-500">{t.footer.contacto}</h3>
          <ul className="mt-5 space-y-3">
            {ranch.contact.phone && (
              <li>
                <a href={telLink(ranch.contact.phone)} className="font-mono text-lg hover:text-gold-500">
                  {ranch.contact.phone}
                </a>
              </li>
            )}
            {ranch.contact.whatsapp && (
              <li>
                <a
                  href={whatsappLink(ranch.contact.whatsapp, t.whatsapp.consulta)}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-cream-50/40 underline-offset-4 hover:text-gold-500"
                >
                  WhatsApp
                </a>
              </li>
            )}
            {ranch.contact.email && (
              <li>
                <a
                  href={`mailto:${ranch.contact.email}`}
                  className="break-all underline decoration-cream-50/40 underline-offset-4 hover:text-gold-500"
                >
                  {ranch.contact.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="rotulo text-gold-500">{t.footer.dondeEstamos}</h3>
          <p className="mt-5 leading-relaxed text-cream-50/85">
            {direccion(ranch, lang)}
            <br />
            {[ranch.location.city, ranch.location.province].filter(Boolean).join(', ')}
          </p>
          {coords && <p className="mt-3 font-mono text-sm text-cream-50/70">{coords}</p>}
        </div>
      </div>

      <div className="border-t border-cream-50/15">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-6 font-mono text-xs text-cream-50/70 sm:flex-row sm:items-center">
          <p>
            © {year} {ranch.name} · Nicoya, Guanacaste, Costa Rica
          </p>
          <Link to="/admin" rel="nofollow" className="hover:text-gold-500">
            {t.footer.admin}
          </Link>
        </div>
      </div>
    </footer>
  )
}
