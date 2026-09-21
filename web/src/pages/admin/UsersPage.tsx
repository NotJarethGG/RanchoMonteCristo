import { useState } from 'react'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Switch } from '@/components/ui/Field'
import { ConfirmModal, Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Table, Td, Th, Tr } from '@/components/ui/Table'
import { Spinner } from '@/components/ui/States'
import { useAuth } from '@/hooks/useAuth'
import { useCreateUser, useDeleteUser, useRoles, useUpdateUser, useUsers } from '@/hooks/useAdminData'
import { formatRelative, initials } from '@/lib/format'
import type { AuthUser } from '@/types'

const EMPTY = { name: '', email: '', password: '', role_id: '', phone: '', is_active: true }

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { data: users, isLoading } = useUsers()
  const { data: roles } = useRoles()
  const create = useCreateUser()
  const update = useUpdateUser()
  const remove = useDeleteUser()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AuthUser | null>(null)
  const [toDelete, setToDelete] = useState<AuthUser | null>(null)
  const [form, setForm] = useState(EMPTY)

  const openModal = (user?: AuthUser) => {
    setEditing(user ?? null)
    setForm(
      user
        ? {
            name: user.name, email: user.email, password: '',
            role_id: String(roles?.find((role) => role.name === user.role)?.id ?? ''),
            phone: user.phone ?? '', is_active: user.is_active,
          }
        : { ...EMPTY, role_id: String(roles?.find((role) => role.name === 'staff')?.id ?? '') },
    )
    setOpen(true)
  }

  const submit = async () => {
    const payload: Record<string, unknown> = {
      name: form.name, email: form.email, role_id: Number(form.role_id),
      phone: form.phone || null, is_active: form.is_active,
    }
    if (form.password) payload.password = form.password

    if (editing) await update.mutateAsync({ id: editing.id, input: payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Quiénes tienen acceso al panel administrativo."
        action={
          <Button icon={<Plus className="size-4" />} onClick={() => openModal()}>
            Nuevo usuario
          </Button>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="size-6" />
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <thead>
                    <tr>
                      <Th>Usuario</Th>
                      <Th>Rol</Th>
                      <Th>Estado</Th>
                      <Th>Último acceso</Th>
                      <Th />
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sage-100 text-xs font-semibold text-forest-700">
                              {initials(user.name)}
                            </span>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-stone-600">{user.email}</p>
                            </div>
                          </div>
                        </Td>
                        <Td>
                          <Badge tone={user.role === 'admin' ? 'gold' : 'info'}>{user.role_label}</Badge>
                        </Td>
                        <Td>
                          <Badge tone={user.is_active ? 'success' : 'neutral'} dot>
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </Td>
                        <Td className="text-sm text-stone-600">{formatRelative(user.last_login_at)}</Td>
                        <Td className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button size="sm" variant="outline" onClick={() => openModal(user)}>
                              Editar
                            </Button>
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => setToDelete(user)}
                                aria-label="Eliminar"
                                className="rounded-full border border-forest-900/12 p-2 text-stone-600 transition-colors hover:border-danger-600/30 hover:bg-danger-100 hover:text-danger-600"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <ul className="divide-y divide-forest-900/6 lg:hidden">
                {users?.map((user) => (
                  <li key={user.id} className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sm font-semibold text-forest-700">
                        {initials(user.name)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-forest-900">{user.name}</p>
                        <p className="truncate text-xs text-stone-600">{user.email}</p>
                      </div>
                      <Badge tone={user.role === 'admin' ? 'gold' : 'info'}>{user.role_label}</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => openModal(user)}>
                      Editar
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card className="h-fit">
          <CardHeader title="Roles" action={<ShieldCheck className="size-4 text-stone-600" />} />
          <CardBody className="space-y-5">
            {roles?.map((role) => (
              <div key={role.id}>
                <div className="flex items-center gap-2">
                  <Badge tone={role.name === 'admin' ? 'gold' : 'info'}>{role.label}</Badge>
                  <span className="text-xs text-stone-600">{role.permissions.length} permisos</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{role.description}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button
              onClick={submit}
              loading={create.isPending || update.isPending}
              disabled={!form.name || !form.email || !form.role_id || (!editing && !form.password)}
            >
              Guardar
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Field label="Nombre" required htmlFor="u_name">
            <Input id="u_name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Correo" required htmlFor="u_email">
              <Input id="u_email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Teléfono" htmlFor="u_phone">
              <Input id="u_phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <Field
            label="Contraseña"
            required={!editing}
            hint={editing ? 'Dejala vacía para no cambiarla.' : 'Mínimo 8 caracteres con letras y números.'}
            htmlFor="u_pass"
          >
            <Input id="u_pass" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
          <Field label="Rol" required htmlFor="u_role">
            <Select id="u_role" value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })}>
              <option value="">Seleccionar…</option>
              {roles?.map((role) => (
                <option key={role.id} value={role.id}>{role.label}</option>
              ))}
            </Select>
          </Field>
          <Switch
            id="u_active"
            checked={form.is_active}
            onChange={(value) => setForm({ ...form, is_active: value })}
            label="Cuenta activa"
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
        title="Eliminar usuario"
        message={`${toDelete?.name} perderá el acceso al panel administrativo.`}
        confirmLabel="Eliminar"
      />
    </>
  )
}
