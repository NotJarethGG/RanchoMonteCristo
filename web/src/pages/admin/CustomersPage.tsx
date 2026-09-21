import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { EmptyState, ErrorState, SkeletonRows } from '@/components/ui/States'
import { Pagination } from '@/components/ui/Pagination'
import { useCreateCustomer, useCustomers } from '@/hooks/useAdminData'
import { useDebounced } from '@/hooks/useDebounced'
import { formatDateShort, initials } from '@/lib/format'

const EMPTY = { full_name: '', phone: '', email: '', identification: '', notes: '' }

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const debounced = useDebounced(search, 350)
  const { data, isLoading, isError, refetch } = useCustomers({ search: debounced || undefined, page })
  const create = useCreateCustomer()

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Base de contactos y su historial de reservas."
        action={
          <Button icon={<Plus className="size-4" />} onClick={() => setOpen(true)}>
            Nuevo cliente
          </Button>
        }
      />

      <Card className="mb-5 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-600/60" />
          <Input
            placeholder="Buscar por nombre, teléfono o correo…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : isLoading ? (
          <SkeletonRows rows={8} cols={5} />
        ) : !data?.data.length ? (
          <EmptyState
            icon={<Users className="size-6" />}
            title={search ? 'Sin resultados' : 'Todavía no hay clientes'}
            description={
              search
                ? 'Probá con otro nombre o teléfono.'
                : 'Los clientes se crean solos cuando llega una solicitud del sitio.'
            }
          />
        ) : (
          <>
            <div className="hidden lg:block">
              <Table>
                <thead>
                  <tr>
                    <Th>Cliente</Th>
                    <Th>Teléfono</Th>
                    <Th>Correo</Th>
                    <Th className="text-center">Reservas</Th>
                    <Th>Última reserva</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((customer) => (
                    <Tr key={customer.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-forest-700">
                            {initials(customer.full_name)}
                          </span>
                          <span className="font-medium">{customer.full_name}</span>
                        </div>
                      </Td>
                      <Td className="text-stone-700">{customer.phone}</Td>
                      <Td className="text-stone-700">{customer.email ?? '—'}</Td>
                      <Td className="text-center tabular-nums">{customer.reservations_count ?? 0}</Td>
                      <Td className="text-stone-700">
                        {customer.last_reservation_at ? formatDateShort(customer.last_reservation_at) : '—'}
                      </Td>
                      <Td className="text-right">
                        <Link
                          to={`/admin/clientes/${customer.id}`}
                          className="inline-flex rounded-full border border-forest-900/12 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-forest-900/5"
                        >
                          Abrir
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <ul className="divide-y divide-forest-900/6 lg:hidden">
              {data.data.map((customer) => (
                <li key={customer.id}>
                  <Link to={`/admin/clientes/${customer.id}`} className="flex items-center gap-3 px-4 py-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sm font-semibold text-forest-700">
                      {initials(customer.full_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-forest-900">{customer.full_name}</p>
                      <p className="truncate text-xs text-stone-600">{customer.phone}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-forest-900 tabular-nums">
                        {customer.reservations_count ?? 0}
                      </p>
                      <p className="text-[11px] text-stone-600">reservas</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            <Pagination
              page={data.meta.current_page}
              lastPage={data.meta.last_page}
              total={data.meta.total}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nuevo cliente"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              loading={create.isPending}
              disabled={!form.full_name || !form.phone}
              onClick={async () => {
                await create.mutateAsync(form)
                setForm(EMPTY)
                setOpen(false)
              }}
            >
              Crear cliente
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Nombre completo" required htmlFor="c_name">
            <Input id="c_name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Teléfono" required htmlFor="c_phone">
              <Input id="c_phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Correo" htmlFor="c_email">
              <Input id="c_email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
          </div>
          <Field label="Identificación" htmlFor="c_id">
            <Input id="c_id" value={form.identification} onChange={(e) => setForm({ ...form, identification: e.target.value })} />
          </Field>
          <Field label="Notas" htmlFor="c_notes">
            <Textarea id="c_notes" className="min-h-20" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </>
  )
}
