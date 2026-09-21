import { useState } from 'react'
import { MessageSquareQuote, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, Spinner } from '@/components/ui/States'
import { cn } from '@/lib/cn'
import { formatDateShort } from '@/lib/format'
import {
  useCreateTestimonial, useDeleteTestimonial, useTestimonials, useUpdateTestimonial,
} from '@/hooks/useAdminData'
import type { Testimonial } from '@/types'

const EMPTY = {
  author_name: '',
  event_type: '',
  rating: 5,
  content: '',
  event_date: '',
  is_published: true,
  sort_order: 0,
}

export default function TestimonialsPage() {
  const { data: testimonials, isLoading } = useTestimonials()
  const create = useCreateTestimonial()
  const update = useUpdateTestimonial()
  const remove = useDeleteTestimonial()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [toDelete, setToDelete] = useState<Testimonial | null>(null)
  const [form, setForm] = useState(EMPTY)

  const openModal = (testimonial?: Testimonial) => {
    setEditing(testimonial ?? null)
    setForm(
      testimonial
        ? {
            author_name: testimonial.author_name,
            event_type: testimonial.event_type ?? '',
            rating: testimonial.rating,
            content: testimonial.content,
            event_date: testimonial.event_date ?? '',
            is_published: testimonial.is_published,
            sort_order: testimonial.sort_order,
          }
        : { ...EMPTY, sort_order: testimonials?.length ?? 0 },
    )
    setOpen(true)
  }

  const submit = async () => {
    const payload = { ...form, event_date: form.event_date || undefined }
    if (editing) await update.mutateAsync({ id: editing.id, input: payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Testimonios"
        description="Opiniones de clientes que se muestran en el sitio."
        action={
          <Button icon={<Plus className="size-4" />} onClick={() => openModal()}>
            Nuevo testimonio
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-6" />
        </div>
      ) : !testimonials?.length ? (
        <Card>
          <EmptyState
            icon={<MessageSquareQuote className="size-6" />}
            title="Sin testimonios"
            description="Agregá las opiniones de quienes ya celebraron en el rancho."
            action={<Button onClick={() => openModal()}>Agregar el primero</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        'size-3.5',
                        index < testimonial.rating ? 'fill-gold-500 text-gold-500' : 'text-sand-300',
                      )}
                    />
                  ))}
                </div>
                {!testimonial.is_published && <Badge tone="neutral">Oculto</Badge>}
              </div>

              <p className="mt-3.5 flex-1 text-sm leading-relaxed text-stone-700">
                {testimonial.content}
              </p>

              <div className="mt-4 border-t border-forest-900/6 pt-3.5">
                <p className="text-sm font-medium text-forest-900">{testimonial.author_name}</p>
                <p className="text-xs text-stone-600">
                  {[testimonial.event_type, testimonial.event_date && formatDateShort(testimonial.event_date)]
                    .filter(Boolean)
                    .join(' · ')}
                </p>

                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" icon={<Pencil className="size-3.5" />} onClick={() => openModal(testimonial)}>
                    Editar
                  </Button>
                  <button
                    onClick={() => setToDelete(testimonial)}
                    aria-label="Eliminar"
                    className="rounded-full border border-forest-900/12 p-2 text-stone-600 transition-colors hover:border-danger-600/30 hover:bg-danger-100 hover:text-danger-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar testimonio' : 'Nuevo testimonio'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={submit} loading={create.isPending || update.isPending} disabled={!form.author_name || !form.content}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre" required htmlFor="t_name">
              <Input id="t_name" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} />
            </Field>
            <Field label="Tipo de evento" htmlFor="t_type">
              <Input id="t_type" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })} placeholder="Boda" />
            </Field>
          </div>

          <Field label="Opinión" required htmlFor="t_content">
            <Textarea id="t_content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Calificación" htmlFor="t_rating">
              <Select id="t_rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value} estrellas</option>
                ))}
              </Select>
            </Field>
            <Field label="Fecha del evento" htmlFor="t_date">
              <Input id="t_date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </Field>
          </div>

          <Switch
            id="t_published"
            checked={form.is_published}
            onChange={(value) => setForm({ ...form, is_published: value })}
            label="Publicado en el sitio"
          />
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
        title="Eliminar testimonio"
        message="Dejará de mostrarse en el sitio público."
        confirmLabel="Eliminar"
      />
    </>
  )
}
