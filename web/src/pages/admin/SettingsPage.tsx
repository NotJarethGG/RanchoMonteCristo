import { useEffect, useState } from 'react'
import { Building2, Languages, MapPin, Phone, Save, Share2, Trash2, Plus } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/States'
import { useSettings, useUpdateSettings } from '@/hooks/useAdminData'

type FormState = {
  name: string; tagline: string; description: string; about: string
  phone: string; whatsapp: string; email: string
  address: string; city: string; province: string
  latitude: string; longitude: string; google_maps_url: string
  capacity: string; check_in_time: string; check_out_time: string
  policies: string
  socials: Record<string, string>
  event_types: string[]
  areas: string[]
  en: TextosEnIngles
}

/**
 * Versión en inglés. Las listas se guardan como «texto en español → en
 * inglés», así siguen alineadas aunque se agreguen o quiten elementos.
 */
type TextosEnIngles = {
  tagline: string; description: string; about: string; address: string; policies: string
  event_types: Record<string, string>
  areas: Record<string, string>
}

const emparejar = (es: string[], en: string[] | undefined) =>
  Object.fromEntries(es.map((item, i) => [item, en?.[i] && en.length === es.length ? en[i] : '']))

const SOCIAL_KEYS = ['facebook', 'instagram', 'tiktok'] as const

export default function SettingsPage() {
  const { data: ranch, isLoading } = useSettings()
  const update = useUpdateSettings()
  const [form, setForm] = useState<FormState | null>(null)

  useEffect(() => {
    if (!ranch) return
    setForm({
      name: ranch.name, tagline: ranch.tagline ?? '', description: ranch.description ?? '',
      about: ranch.about ?? '',
      phone: ranch.contact.phone ?? '', whatsapp: ranch.contact.whatsapp ?? '', email: ranch.contact.email ?? '',
      address: ranch.location.address ?? '', city: ranch.location.city ?? '', province: ranch.location.province ?? '',
      latitude: ranch.location.latitude?.toString() ?? '', longitude: ranch.location.longitude?.toString() ?? '',
      google_maps_url: ranch.location.google_maps_url ?? '',
      capacity: ranch.capacity?.toString() ?? '', check_in_time: ranch.check_in_time?.slice(0, 5) ?? '',
      check_out_time: ranch.check_out_time?.slice(0, 5) ?? '',
      policies: ranch.policies ?? '',
      socials: Object.fromEntries(SOCIAL_KEYS.map((key) => [key, ranch.socials?.[key] ?? ''])),
      event_types: ranch.event_types ?? [],
      areas: ranch.areas ?? [],
      en: {
        tagline: ranch.translations?.en?.tagline ?? '',
        description: ranch.translations?.en?.description ?? '',
        about: ranch.translations?.en?.about ?? '',
        address: ranch.translations?.en?.address ?? '',
        policies: ranch.translations?.en?.policies ?? '',
        event_types: emparejar(ranch.event_types ?? [], ranch.translations?.en?.event_types),
        areas: emparejar(ranch.areas ?? [], ranch.translations?.en?.areas),
      },
    })
  }, [ranch])

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    )
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))

  const setEn = <K extends keyof TextosEnIngles>(key: K, value: TextosEnIngles[K]) =>
    setForm((prev) => (prev ? { ...prev, en: { ...prev.en, [key]: value } } : prev))

  // Una lista va traducida completa o no va: lo que falte se completa con el
  // español, y si no hay nada en inglés se manda vacía (el sitio usa el español).
  const listaEn = (es: string[], en: Record<string, string>) =>
    es.some((item) => en[item]?.trim()) ? es.map((item) => en[item]?.trim() || item) : []

  const { en, ...general } = form
  const save = () =>
    update.mutate({
      ...general,
      translations: {
        en: {
          tagline: en.tagline.trim() || null,
          description: en.description.trim() || null,
          about: en.about.trim() || null,
          address: en.address.trim() || null,
          policies: en.policies.trim() || null,
          event_types: listaEn(form.event_types, en.event_types),
          areas: listaEn(form.areas, en.areas),
          // El horario no se edita desde el panel: se conserva el que hay.
          schedule: ranch?.translations?.en?.schedule,
        },
      },
      capacity: form.capacity ? Number(form.capacity) : undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      check_in_time: form.check_in_time || undefined,
      check_out_time: form.check_out_time || undefined,
      google_maps_url: form.google_maps_url || undefined,
      socials: Object.fromEntries(
        Object.entries(form.socials).map(([key, value]) => [key, value || null]),
      ),
    })

  return (
    <>
      <PageHeader
        title="Configuración"
        description="Información general del rancho que se muestra en el sitio."
        action={
          <Button icon={<Save className="size-4" />} loading={update.isPending} onClick={save}>
            Guardar cambios
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Información general" />
          <CardBody className="space-y-5">
            <Field label="Nombre del rancho" required htmlFor="st_name">
              <Input id="st_name" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="Frase principal" hint="Se muestra como título del hero." htmlFor="st_tagline">
              <Input id="st_tagline" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
            </Field>
            <Field label="Subtítulo" htmlFor="st_desc">
              <Textarea id="st_desc" className="min-h-20" value={form.description} onChange={(e) => set('description', e.target.value)} />
            </Field>
            <Field label="Sobre el rancho" hint="Texto largo de la sección «El rancho»." htmlFor="st_about">
              <Textarea id="st_about" className="min-h-32" value={form.about} onChange={(e) => set('about', e.target.value)} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Capacidad" htmlFor="st_cap">
                <Input id="st_cap" type="number" min={0} value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
              </Field>
              <Field label="Entrada" htmlFor="st_in">
                <Input id="st_in" type="time" value={form.check_in_time} onChange={(e) => set('check_in_time', e.target.value)} />
              </Field>
              <Field label="Salida" htmlFor="st_out">
                <Input id="st_out" type="time" value={form.check_out_time} onChange={(e) => set('check_out_time', e.target.value)} />
              </Field>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Contacto" action={<Phone className="size-4 text-stone-600" />} />
            <CardBody className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Teléfono" htmlFor="st_phone">
                  <Input id="st_phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </Field>
                <Field label="WhatsApp" hint="Solo números, con código de país." htmlFor="st_wa">
                  <Input id="st_wa" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="50688881122" />
                </Field>
              </div>
              <Field label="Correo" htmlFor="st_email">
                <Input id="st_email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Ubicación" action={<MapPin className="size-4 text-stone-600" />} />
            <CardBody className="space-y-5">
              <Field label="Dirección" htmlFor="st_addr">
                <Input id="st_addr" value={form.address} onChange={(e) => set('address', e.target.value)} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Cantón / ciudad" htmlFor="st_city">
                  <Input id="st_city" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </Field>
                <Field label="Provincia" htmlFor="st_prov">
                  <Input id="st_prov" value={form.province} onChange={(e) => set('province', e.target.value)} />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Latitud" htmlFor="st_lat">
                  <Input id="st_lat" value={form.latitude} onChange={(e) => set('latitude', e.target.value)} placeholder="10.1128" />
                </Field>
                <Field label="Longitud" htmlFor="st_lng">
                  <Input id="st_lng" value={form.longitude} onChange={(e) => set('longitude', e.target.value)} placeholder="-84.3799" />
                </Field>
              </div>
              <Field label="Enlace de Google Maps" htmlFor="st_gmaps">
                <Input id="st_gmaps" value={form.google_maps_url} onChange={(e) => set('google_maps_url', e.target.value)} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Redes sociales" action={<Share2 className="size-4 text-stone-600" />} />
            <CardBody className="space-y-5">
              {SOCIAL_KEYS.map((key) => (
                <Field key={key} label={key[0].toUpperCase() + key.slice(1)} htmlFor={`st_${key}`}>
                  <Input
                    id={`st_${key}`}
                    value={form.socials[key] ?? ''}
                    onChange={(e) => set('socials', { ...form.socials, [key]: e.target.value })}
                    placeholder={`https://${key}.com/…`}
                  />
                </Field>
              ))}
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader title="Tipos de evento y áreas" action={<Building2 className="size-4 text-stone-600" />} />
          <CardBody className="space-y-6">
            <TagListEditor
              label="Tipos de evento"
              hint="Alimentan el selector del formulario público."
              items={form.event_types}
              onChange={(items) => set('event_types', items)}
            />
            <TagListEditor
              label="Áreas disponibles"
              items={form.areas}
              onChange={(items) => set('areas', items)}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Políticas" description="Se muestran junto al calendario del sitio." />
          <CardBody>
            <Textarea
              className="min-h-48"
              value={form.policies}
              onChange={(e) => set('policies', e.target.value)}
              placeholder={'• La fecha se aparta con un adelanto del 50%.\n• El saldo se cancela el día del evento.'}
            />
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader
            title="Versión en inglés"
            description="Lo que se ve en la página en inglés (/en). Lo que dejés vacío aparece en español."
            action={<Languages className="size-4 text-stone-600" />}
          />
          <CardBody className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-5">
              <Field label="Frase principal (inglés)" hint={form.tagline} htmlFor="st_en_tagline">
                <Input id="st_en_tagline" lang="en" value={en.tagline} onChange={(e) => setEn('tagline', e.target.value)} />
              </Field>
              <Field label="Subtítulo (inglés)" htmlFor="st_en_desc">
                <Textarea id="st_en_desc" lang="en" className="min-h-20" value={en.description} onChange={(e) => setEn('description', e.target.value)} />
              </Field>
              <Field label="Sobre el rancho (inglés)" htmlFor="st_en_about">
                <Textarea id="st_en_about" lang="en" className="min-h-32" value={en.about} onChange={(e) => setEn('about', e.target.value)} />
              </Field>
              <Field label="Dirección (inglés)" hint={form.address} htmlFor="st_en_addr">
                <Input id="st_en_addr" lang="en" value={en.address} onChange={(e) => setEn('address', e.target.value)} />
              </Field>
              <Field label="Políticas (inglés)" htmlFor="st_en_policies">
                <Textarea id="st_en_policies" lang="en" className="min-h-40" value={en.policies} onChange={(e) => setEn('policies', e.target.value)} />
              </Field>
            </div>

            <div className="space-y-6">
              <ListaEnIngles
                label="Tipos de evento (inglés)"
                items={form.event_types}
                values={en.event_types}
                onChange={(values) => setEn('event_types', values)}
              />
              <ListaEnIngles
                label="Áreas (inglés)"
                items={form.areas}
                values={en.areas}
                onChange={(values) => setEn('areas', values)}
              />
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button icon={<Save className="size-4" />} loading={update.isPending} onClick={save}>
          Guardar cambios
        </Button>
      </div>
    </>
  )
}

/** Editor de listas simples (chips) para tipos de evento y áreas. */
function TagListEditor({
  label,
  hint,
  items,
  onChange,
}: {
  label: string
  hint?: string
  items: string[]
  onChange: (items: string[]) => void
}) {
  const [value, setValue] = useState('')

  const add = () => {
    const trimmed = value.trim()
    if (trimmed && !items.includes(trimmed)) onChange([...items, trimmed])
    setValue('')
  }

  return (
    <div>
      <p className="text-sm font-medium text-forest-800">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-stone-600">{hint}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 py-1.5 pl-3.5 pr-2 text-sm text-forest-800"
          >
            {item}
            <button
              onClick={() => onChange(items.filter((current) => current !== item))}
              aria-label={`Quitar ${item}`}
              className="rounded-full p-0.5 text-forest-700/60 transition-colors hover:bg-forest-900/10 hover:text-danger-600"
            >
              <Trash2 className="size-3" />
            </button>
          </span>
        ))}
        {!items.length && <p className="text-sm text-stone-600">Sin elementos.</p>}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              add()
            }
          }}
          placeholder="Agregar…"
        />
        <Button variant="outline" size="md" icon={<Plus className="size-4" />} onClick={add}>
          Agregar
        </Button>
      </div>
    </div>
  )
}

/** Una fila por elemento de la lista en español, con su traducción al lado. */
function ListaEnIngles({
  label,
  items,
  values,
  onChange,
}: {
  label: string
  items: string[]
  values: Record<string, string>
  onChange: (values: Record<string, string>) => void
}) {
  return (
    <div>
      <p className="text-sm font-medium text-forest-800">{label}</p>
      {!items.length && <p className="mt-2 text-sm text-stone-600">Primero agregalos en español.</p>}
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="grid items-center gap-2 sm:grid-cols-[1fr_1.2fr]">
            <span className="text-sm text-stone-600">{item}</span>
            <Input
              lang="en"
              aria-label={`${item} en inglés`}
              value={values[item] ?? ''}
              onChange={(event) => onChange({ ...values, [item]: event.target.value })}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
