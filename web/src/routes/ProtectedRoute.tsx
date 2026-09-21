import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/States'

/**
 * Cierra el área administrativa. `requireAdmin` restringe además las
 * secciones que solo puede ver el rol ADMIN.
 */
export function ProtectedRoute({ requireAdmin = false }: { requireAdmin?: boolean }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream-50">
        <Spinner className="size-7" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}
