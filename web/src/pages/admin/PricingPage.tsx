import { useState } from 'react'
import { Calculator, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { EmptyState, Spinner } from '@/components/ui/States'
import { cn } from '@/lib/cn'
import { formatMoney } from '@/lib/format'
import { pricingService } from '@/services/admin.service'
import {
  useCreatePricingRule, useDeletePricingRule, usePricing, useUpdatePricingRule,
} from '@/hooks/useAdminData'
import type { PricingRule } from '@/types'

const WEEKDAYS = [
  { value: 1, label: 'Lun' }, { value: 2, label: 'Mar' }, { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' }, { value: 5, label: 'Vie' }, { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
]

const EMPTY = {
  name: '', type: 'base', amount_type: 'fixed', amount: 0,
  starts_on: '', ends_on: '', weekdays: [] as number[],
  min_guests: '', max_guests: '', priority: 100, is_active: true, description: '',
}

export default function PricingPage() {
  const { data, isLoading } = usePricing()
  const create = useCreatePricingRule()
  const update = useUpdatePricingRule()
  const remove = useDeletePricingRule()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PricingRule | null>(null)
  const [toDelete, setToDelete] = useState<PricingRule | null>(null)
  const [form, setForm] = useState(EMPTY)

  // Simulador: verifica el efecto real de las reglas sin crear una reserva.
  const [sim, setSim] = useState({ date: '', guests: 50 })
  const [simResult, setSimResult] = useState<{ total: number; deposit: number } | null>(null)
  const [simLoading, setSimLoading] = useState(false)

  const openModal = (rule?: PricingRule) => {
    setEditing(rule ?? null)
    setForm(
      rule
        ? {
            name: rule.name, type: rule.type, amount_type: rule.amount_type, amount: rule.amount,
            starts_on: rule.starts_on ?? '', ends_on: rule.ends_on ?? '', weekdays: rule.weekdays ?? [],
            min_guests: rule.min_guests?.toString() ?? '', max_guests: rule.max_guests?.toString() ?? '',
            priority: rule.priority, is_active: rule.is_active, description: rule.description ?? '',
          }
        : EMPTY,
    )
    setOpen(true)
  }

  const submit = async () => {
    const payload = {
      ...form,
      amount: Number(form.amount),
      starts_on: form.starts_on || undefined,
      ends_on: form.ends_on || undefined,
      weekdays: form.weekdays.length ? form.weekdays : undefined,
      min_guests: form.min_guests ? Number(form.min_guests) : undefined,
      max_guests: form.max_guests ? Number(form.max_guests) : undefined,
    }
    if (editing) await update.mutateAsync({ id: editing.id, input: payload })
    else await create.mutateAsync(payload as never)
    setOpen(false)
  }

  const runSimulation = async () => {
    if (!sim.date) return
    setSimLoading(true)
    try {
      setSimResult(await pricingService.simulate(sim.date, sim.guests))
    } finally {
      setSimLoading(false)
    }
  }

  const formatAmount = (rule: PricingRule) =>
    rule.amount_type === 'percentage' ? `${rule.amount}%` : formatMoney(rule.amount)

  return (
    <>
      <PageHeader
        title="Precios"
        description="Reglas que determinan el precio de cada fecha."
        action={
          <Button icon={<Plus className="size-4" />} onClick={() => openModal()}>
            Nueva regla
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader
            title="Reglas activas"
            description="Se aplican en orden de prioridad: menor número, primero."
          />

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : !data?.data.length ? (
            <EmptyState
              icon={<Tags className="size-6" />}
              title="Sin reglas de precio"
              description="Creá al menos una regla base para poder cotizar."
              action={<Button onClick={() => openModal()}>Crear regla base</Button>}
            />
          ) : (
            <ul className="divide-y divide-forest-900/6">
              {data.data.map((rule) => (
                <li key={rule.id} className="px-5 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-forest-900">{rule.name}</p>
                        <Badge tone={rule.type === 'base' ? 'gold' : 'info'}>{rule.type_label}</Badge>
                        {!rule.is_active && <Badge tone="neutral">Inactiva</Badge>}
                      </div>

                      <p className="mt-1.5 text-sm text-stone-600">
                        {formatAmount(rule)} · {rule.amount_type_label}
                        {rule.min_guests && ` · desde ${rule.min_guests} personas`}
                        {rule.weekdays?.length
                          ? ` · ${rule.weekdays.map((d) => WEEKDAYS.find((w) => w.value === d)?.label).join(', ')}`
                          : ''}
                      </p>

                      {rule.description && (
                        <p className="mt-1 text-xs text-stone-600">{rule.description}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => openModal(rule)}
                        aria-label="Editar"
                        className="rounded-lg border border-forest-900/12 p-2 text-stone-600 transition-colors hover:bg-forest-900/5"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setToDelete(rule)}
                        aria-label="Eliminar"
                        className="rounded-lg border border-forest-900/12 p-2 text-stone-600 transition-colors hover:border-danger-600/30 hover:bg-danger-100 hover:text-danger-600"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="Simulador" description="Probá el precio de una fecha concreta." />
          <CardBody className="space-y-4">
            <Field label="Fecha" htmlFor="sim_date">
              <Input id="sim_date" type="date" value={sim.date} onChange={(e) => setSim({ ...sim, date: e.target.value })} />
            </Field>
            <Field label="Personas" htmlFor="sim_guests">
              <Input id="sim_guests" type="number" min={1} value={sim.guests} onChange={(e) => setSim({ ...sim, guests: Number(e.target.value) })} />
            </Field>

            <Button
              className="w-full"
              variant="secondary"
              icon={<Calculator className="size-4" />}
              loading={simLoading}
              disabled={!sim.date}
              onClick={runSimulation}
            >
              Calcular
            </Button>

            {simResult && (
              <div className="animate-fade-up rounded-xl bg-sand-100 p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-stone-600">Precio calculado</p>
                <p className="mt-1 font-display text-3xl text-forest-900">{formatMoney(simResult.total)}</p>
                <p className="mt-1 text-xs text-stone-600">
                  Adelanto sugerido: {formatMoney(simResult.deposit)}
                </p>
              </div>
            )}

            {data?.meta && (
              <p className="border-t border-forest-900/8 pt-4 text-xs leading-relaxed text-stone-600">
                El adelanto se calcula como el {data.meta.deposit_percentage}% del total
                (configurable en <code className="text-[11px]">config/ranch.php</code>).
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title={editing ? 'Editar regla' : 'Nueva regla de precio'}
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
          <Field label="Nombre" required htmlFor="p_name">
            <Input id="p_name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Recargo fin de semana" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Tipo" htmlFor="p_type">
              <Select id="p_type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {data?.meta.types.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Cálculo" htmlFor="p_amount_type">
              <Select id="p_amount_type" value={form.amount_type} onChange={(e) => setForm({ ...form, amount_type: e.target.value })}>
                {data?.meta.amount_types.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
            </Field>
            <Field label={form.amount_type === 'percentage' ? 'Porcentaje' : 'Monto'} required htmlFor="p_amount">
              <Input id="p_amount" type="number" min={0} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </Field>
          </div>

          <Field label="Días de la semana" hint="Vacío = aplica todos los días.">
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => {
                const active = form.weekdays.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        weekdays: active
                          ? form.weekdays.filter((d) => d !== day.value)
                          : [...form.weekdays, day.value],
                      })
                    }
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                      active
                        ? 'border-clay-600 bg-clay-600 text-cream-50'
                        : 'border-forest-900/12 text-forest-800 hover:bg-forest-900/5',
                    )}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Desde" hint="Opcional, para temporadas." htmlFor="p_start">
              <Input id="p_start" type="date" value={form.starts_on} onChange={(e) => setForm({ ...form, starts_on: e.target.value })} />
            </Field>
            <Field label="Hasta" htmlFor="p_end">
              <Input id="p_end" type="date" value={form.ends_on} onChange={(e) => setForm({ ...form, ends_on: e.target.value })} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Mín. personas" htmlFor="p_min">
              <Input id="p_min" type="number" min={1} value={form.min_guests} onChange={(e) => setForm({ ...form, min_guests: e.target.value })} />
            </Field>
            <Field label="Máx. personas" htmlFor="p_max">
              <Input id="p_max" type="number" min={1} value={form.max_guests} onChange={(e) => setForm({ ...form, max_guests: e.target.value })} />
            </Field>
            <Field label="Prioridad" hint="Menor = primero." htmlFor="p_priority">
              <Input id="p_priority" type="number" min={0} value={form.priority} onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })} />
            </Field>
          </div>

          <Field label="Descripción" htmlFor="p_desc">
            <Textarea id="p_desc" className="min-h-20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>

          <Switch
            id="p_active"
            checked={form.is_active}
            onChange={(value) => setForm({ ...form, is_active: value })}
            label="Regla activa"
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
        title="Eliminar regla"
        message="Las cotizaciones futuras dejarán de considerarla. Las reservas ya creadas mantienen su precio."
        confirmLabel="Eliminar"
      />
    </>
  )
}
