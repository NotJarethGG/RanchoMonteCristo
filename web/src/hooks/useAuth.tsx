import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authService } from '@/services/auth.service'
import { normalizeError, tokenStorage, UNAUTHORIZED_EVENT } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { AuthUser } from '@/types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string, remember: boolean) => Promise<void>
  logout: () => Promise<void>
  can: (permission: string) => boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Rehidrata la sesión al cargar la app si hay token guardado.
  useEffect(() => {
    let active = true

    async function hydrate() {
      if (!tokenStorage.get()) {
        setLoading(false)
        return
      }
      try {
        const me = await authService.me()
        if (active) setUser(me)
      } catch {
        tokenStorage.clear()
      } finally {
        if (active) setLoading(false)
      }
    }

    hydrate()
    return () => {
      active = false
    }
  }, [])

  // El interceptor de axios avisa cuando el token expiró.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null)
      queryClient.clear()
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    try {
      const result = await authService.login(email, password, remember)
      tokenStorage.set(result.token, remember)
      setUser(result.user)
    } catch (error) {
      throw normalizeError(error)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Da igual si el token ya venció: igual limpiamos el cliente.
    } finally {
      tokenStorage.clear()
      setUser(null)
      queryClient.clear()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      can: (permission) => user?.permissions.includes(permission) ?? false,
    }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
