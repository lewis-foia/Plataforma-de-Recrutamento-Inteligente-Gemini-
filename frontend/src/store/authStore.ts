import { create } from 'zustand'
import { api } from '@/lib/axios'

export interface User {
  id: string
  email: string
  role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE'
  is_active: boolean
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, full_name: string) => Promise<void>
  logout: () => void
  fetchMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,          // começa a carregar
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    await get().fetchMe()
  },

  register: async (email, password, full_name) => {
    await api.post('/auth/register', { email, password, full_name })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.clear()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))