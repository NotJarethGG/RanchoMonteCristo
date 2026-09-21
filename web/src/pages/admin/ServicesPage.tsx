import { useState } from 'react'
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, Spinner } from '@/components/ui/States'
import { ServiceIcon, iconOptions } from '@/components/ui/Icon'
import { useCreateService, useDeleteService, useServices, useUpdateService } from '@/hooks/useAdminData'
import type { Service } from '@/types'

const EMPTY = { name: '', description: '', icon: 'sparkles', is_active: true, sort_order: 0 }

export default function ServicesPage() {
  const { data: services, isLoading } = useServices()
  const create = useCreateService()
  const update = useUpdateService()
  const remove = useDeleteService()

  const [editing, setEditing] = useState<Service | null>(null)
  const [open, setOpen] = useState(false)
  const [toDelete, setToDelete] = useState<Service | null>(null)
  const [form, setForm] = useState(EMPTY)

  const openModal = (service?: Service) => {
    setEditing(service ?? null)
    setForm(
      service
        ? {
            name: service.name,
            description: service.description ?? '',
            icon: service.icon,
            is_active: service.is_active,
            sort_order: service.sort_order,
          }
        : { ...EMPTY, sort_order: services?.length ?? 0 },
    )
    setOpen(true)
  }

  const submit = async () => {
    if (editing) await update.mutateAsync({ id: editing.id, input: form })
    else await create.mutateAsync(form)
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Lo que se muestra en la sección de servicios del sitio."
        action={
          <Button icon={<Plus className="size-4" />} onClick={() => openModal()}>
            Nuevo servicio
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-6" />
        </div>
      ) : !services?.length ? (
        <Card>
          <EmptyState
            icon={<Sparkles className="size-6" />}
            title="Sin servicios"
            description="Agregá lo que incluye el alquiler: rancho techado, parrilla, parqueo…"
            action={<Button onClick={() => openModal()}>Agregar el primero</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-forest-800 text-gold-500">
                  <ServiceIcon name={service.icon} className="size-5" />
                </span>
                {!service.is_active && <Badge tone="neutral">Inactivo</Badge>}
              </div>

              <h3 className="mt-4 font-display text-lg text-forest-900">{service.name}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-stone-600">
                {service.description || 'Sin descripción'}
              </p>

              <div className="mt-5 flex gap-2 border-t border-forest-900/6 pt-4">
                <Button size="sm" variant="outline" className="flex-1" icon={<Pencil className="size-3.5" />} onClick={() => openModal(service)}>
                  Editar
                </Button>
                <button
                  onClick={() => setToDelete(service)}
                  aria-label="Eliminar"
                  className="rounded-full border border-forest-900/12 p-2 text-stone-600 transition-colors hover:border-danger-600/30 hover:bg-danger-100 hover:text-danger-600"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar servicio' : 'Nuevo servicio'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} loading={create.isPending || update.isPending} disabled={!form.name}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Nombre" required htmlFor="s_name">
            <Input id="s_name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>

          <Field label="Descripción" htmlFor="s_desc">
            <Textarea id="s_desc" className="min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          <Field label="Icono" htmlFor="s_icon">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sage-100 text-forest-700">
                <ServiceIcon name={form.icon} className="size-5" />
              </span>
              <Select id="s_icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}>
                {iconOptions.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </Select>
            </div>
          </Field>

          <div className="flex items-center justify-between gap-4">
            <Switch
              id="s_active"
              checked={form.is_active}
              onChange={(value) => setForm({ ...form, is_active: value })}
              label="Visible en el sitio"
            />
            <Field label="Orden" htmlFor="s_order" className="w-28">
              <Input id="s_order" type="number" min={0} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete) await remove.mutateAsync(toDelete.id)
          setToDelete(null)
        }}
        loading={remove.isPending}
        title="Eliminar servicio"
        message={`"${toDelete?.name}" dejará de mostrarse en el sitio. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </>
  )
}
