import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Image as ImageIcon, Pencil, Star, Trash2, Upload } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { EnIngles, textoOpcional } from '@/components/admin/EnIngles'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, Spinner } from '@/components/ui/States'
import { cn } from '@/lib/cn'
import {
  useCreateImage, useDeleteImage, useGallery, useReorderGallery, useUpdateImage,
} from '@/hooks/useAdminData'
import type { GalleryImage } from '@/types'

export default function GalleryPage() {
  const { data: images, isLoading } = useGallery()
  const create = useCreateImage()
  const update = useUpdateImage()
  const remove = useDeleteImage()
  const reorder = useReorderGallery()

  const fileInput = useRef<HTMLInputElement>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [toDelete, setToDelete] = useState<GalleryImage | null>(null)
  const [meta, setMeta] = useState({ title: '', title_en: '', category: '', url: '' })
  const [file, setFile] = useState<File | null>(null)
  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [textos, setTextos] = useState({ title: '', title_en: '' })

  const openEdit = (image: GalleryImage) => {
    setEditing(image)
    setTextos({ title: image.title ?? '', title_en: image.translations?.en?.title ?? '' })
  }

  const saveEdit = async () => {
    if (!editing) return
    await update.mutateAsync({
      id: editing.id,
      input: {
        title: textoOpcional(textos.title),
        // Se conservan el alt y el pie en inglés que ya tenga la foto.
        translations: { en: { ...editing.translations?.en, title: textoOpcional(textos.title_en) } },
      },
    })
    setEditing(null)
  }

  const submit = async () => {
    // Se acepta archivo local o URL externa (útil para placeholders).
    if (file) {
      const data = new FormData()
      data.append('image', file)
      if (meta.title) data.append('title', meta.title)
      if (meta.category) data.append('category', meta.category)
      if (meta.title_en.trim()) data.append('translations[en][title]', meta.title_en.trim())
      await create.mutateAsync(data)
    } else if (meta.url) {
      await create.mutateAsync({
        path: meta.url,
        title: meta.title,
        category: meta.category,
        translations: { en: { title: textoOpcional(meta.title_en) } },
      } as never)
    }
    setFile(null)
    setMeta({ title: '', title_en: '', category: '', url: '' })
    setUploadOpen(false)
  }

  /** Intercambia el orden con la imagen vecina. */
  const move = (index: number, direction: -1 | 1) => {
    if (!images) return
    const target = index + direction
    if (target < 0 || target >= images.length) return

    reorder.mutate({
      items: [
        { id: images[index].id, sort_order: target },
        { id: images[target].id, sort_order: index },
      ],
    } as never)
  }

  return (
    <>
      <PageHeader
        title="Galería"
        description="Fotografías que se muestran en el sitio público."
        action={
          <Button icon={<Upload className="size-4" />} onClick={() => setUploadOpen(true)}>
            Subir imagen
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner className="size-6" />
        </div>
      ) : !images?.length ? (
        <Card>
          <EmptyState
            icon={<ImageIcon className="size-6" />}
            title="Galería vacía"
            description="Subí fotos del rancho para mostrarlas en la página principal."
            action={<Button onClick={() => setUploadOpen(true)}>Subir la primera</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((image, index) => (
            <Card key={image.id} className="overflow-hidden p-0">
              <div className="relative aspect-4/3 bg-sand-200">
                <img src={image.url} alt={image.alt ?? ''} className="size-full object-cover" loading="lazy" />

                {image.is_featured && (
                  <span className="absolute left-2.5 top-2.5">
                    <Badge tone="gold">
                      <Star className="size-3 fill-current" />
                      Principal
                    </Badge>
                  </span>
                )}
                {!image.is_active && (
                  <span className="absolute right-2.5 top-2.5">
                    <Badge tone="neutral">Oculta</Badge>
                  </span>
                )}
              </div>

              <div className="p-3.5">
                <p className="truncate text-sm font-medium text-forest-900">
                  {image.title || 'Sin título'}
                </p>
                {image.translations?.en?.title && (
                  <p lang="en" className="truncate text-xs text-stone-600">EN · {image.translations.en.title}</p>
                )}
                {image.category && (
                  <p className="mt-0.5 text-xs capitalize text-stone-600">
                    {image.category.replace(/-/g, ' ')}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => update.mutate({ id: image.id, input: { is_featured: !image.is_featured } })}
                    title="Definir como principal"
                    className={cn(
                      'rounded-lg border p-1.5 transition-colors',
                      image.is_featured
                        ? 'border-gold-500/40 bg-gold-100 text-gold-600'
                        : 'border-forest-900/12 text-stone-600 hover:bg-forest-900/5',
                    )}
                  >
                    <Star className={cn('size-3.5', image.is_featured && 'fill-current')} />
                  </button>

                  <button
                    onClick={() => update.mutate({ id: image.id, input: { is_active: !image.is_active } })}
                    className="rounded-lg border border-forest-900/12 px-2.5 py-1.5 text-[11px] font-medium text-stone-600 transition-colors hover:bg-forest-900/5"
                  >
                    {image.is_active ? 'Ocultar' : 'Mostrar'}
                  </button>

                  <div className="ml-auto flex gap-1">
                    <button
                      onClick={() => openEdit(image)}
                      aria-label="Editar título"
                      title="Editar título"
                      className="rounded-lg border border-forest-900/12 p-1.5 text-stone-600 transition-colors hover:bg-forest-900/5"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Subir"
                      className="rounded-lg border border-forest-900/12 p-1.5 text-stone-600 transition-colors hover:bg-forest-900/5 disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === images.length - 1}
                      aria-label="Bajar"
                      className="rounded-lg border border-forest-900/12 p-1.5 text-stone-600 transition-colors hover:bg-forest-900/5 disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setToDelete(image)}
                      aria-label="Eliminar"
                      className="rounded-lg border border-forest-900/12 p-1.5 text-stone-600 transition-colors hover:border-danger-600/30 hover:bg-danger-100 hover:text-danger-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Agregar imagen"
        description="Subí un archivo o pegá la URL de una imagen."
        footer={
          <>
            <Button variant="ghost" onClick={() => setUploadOpen(false)}>Cancelar</Button>
            <Button onClick={submit} loading={create.isPending} disabled={!file && !meta.url}>
              Agregar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-forest-900/15 bg-sand-100/60 px-6 py-9 text-center transition-colors hover:border-clay-500 hover:bg-clay-100/30"
          >
            <Upload className="size-6 text-stone-600" />
            <span className="text-sm font-medium text-forest-800">
              {file ? file.name : 'Seleccionar archivo'}
            </span>
            <span className="text-xs text-stone-600">JPG, PNG o WebP · máximo 8 MB</span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />

          {!file && (
            <Field label="…o pegá una URL" htmlFor="g_url">
              <Input
                id="g_url"
                value={meta.url}
                onChange={(e) => setMeta({ ...meta, url: e.target.value })}
                placeholder="https://…"
              />
            </Field>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Título" htmlFor="g_title">
              <Input id="g_title" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} />
            </Field>
            <Field label="Categoría" hint="rancho, eventos, areas-verdes…" htmlFor="g_cat">
              <Input id="g_cat" value={meta.category} onChange={(e) => setMeta({ ...meta, category: e.target.value })} />
            </Field>
          </div>

          <EnIngles>
            <Field label="Título" htmlFor="g_title_en">
              <Input id="g_title_en" lang="en" value={meta.title_en} onChange={(e) => setMeta({ ...meta, title_en: e.target.value })} />
            </Field>
          </EnIngles>
        </div>
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Editar título"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button onClick={saveEdit} loading={update.isPending}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Título" htmlFor="g_edit_title">
            <Input id="g_edit_title" value={textos.title} onChange={(e) => setTextos({ ...textos, title: e.target.value })} />
          </Field>
          <EnIngles>
            <Field label="Título" htmlFor="g_edit_title_en">
              <Input id="g_edit_title_en" lang="en" value={textos.title_en} onChange={(e) => setTextos({ ...textos, title_en: e.target.value })} />
            </Field>
          </EnIngles>
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
        title="Eliminar imagen"
        message="La imagen se borra del servidor y deja de aparecer en el sitio."
        confirmLabel="Eliminar"
      />
    </>
  )
}
