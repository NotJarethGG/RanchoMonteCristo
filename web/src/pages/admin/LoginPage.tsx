import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from '@/lib/validation'
import { ArrowLeft, Lock, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { Field, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import type { NormalizedError } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Ingresá un correo válido.'),
  password: z.string().min(1, 'Ingresá tu contraseña.'),
  remember: z.boolean(),
})

type LoginValues = z.infer<typeof schema>

export default function LoginPage() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: true },
  })

  if (!loading && user) {
    const from = (location.state as { from?: string } | null)?.from ?? '/admin'
    return <Navigate to={from} replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    try {
      await login(values.email, values.password, values.remember)
      toast.success('Bienvenido de vuelta')
      navigate((location.state as { from?: string } | null)?.from ?? '/admin', { replace: true })
    } catch (error) {
      const normalized = error as NormalizedError
      if (normalized.errors?.email) setError('email', { message: normalized.errors.email[0] })
      else toast.error(normalized.message ?? 'No pudimos iniciar sesión.')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Columna visual: refuerza la marca también en el acceso interno */}
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-bark-950/90 to-bark-950/40" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">
            Panel administrativo
          </p>
          <h1 className="mt-4 max-w-md font-display text-4xl leading-tight text-cream-50">
            Rancho Monte Cristo
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-cream-50/70">
            Administrá reservas, clientes, pagos y el contenido del sitio desde un solo lugar.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream-50 px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-stone-600 transition-colors hover:text-clay-600"
          >
            <ArrowLeft className="size-4" />
            Volver al sitio
          </Link>

          <h2 className="mt-8 font-display text-3xl text-forest-900">Iniciar sesión</h2>
          <p className="mt-2 text-sm text-stone-600">
            Ingresá con tu cuenta para administrar el rancho.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            <Field label="Correo electrónico" error={errors.email?.message} htmlFor="email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-600/60" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@ranchomontecristo.com"
                  className="pl-10"
                  invalid={!!errors.email}
                  {...register('email')}
                />
              </div>
            </Field>

            <Field label="Contraseña" error={errors.password?.message} htmlFor="password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-600/60" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10"
                  invalid={!!errors.password}
                  {...register('password')}
                />
              </div>
            </Field>

            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-stone-700">
              <input
                type="checkbox"
                className="size-4 rounded border-forest-900/20 accent-clay-600"
                {...register('remember')}
              />
              Recordarme en este dispositivo
            </label>

            <Button type="submit" size="lg" loading={submitting} className="w-full">
              Entrar
            </Button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-8 rounded-xl border border-forest-900/10 bg-sand-100 p-4 text-xs leading-relaxed text-stone-600">
              <p className="font-semibold text-forest-800">Cuentas de prueba</p>
              <p className="mt-1.5">admin@ranchomontecristo.com · password123</p>
              <p>staff@ranchomontecristo.com · password123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
