import { api } from '@/lib/api'
import type { AuthUser, LoginResponse } from '@/types'

export const authService = {
  async login(email: string, password: string, remember: boolean) {
    const { data } = await api.post<{ data: LoginResponse }>('/auth/login', {
      email,
      password,
      remember,
    })
    return data.data
  },

  async me() {
    const { data } = await api.get<{ data: AuthUser }>('/auth/me')
    return data.data
  },

  async logout() {
    await api.post('/auth/logout')
  },
}
