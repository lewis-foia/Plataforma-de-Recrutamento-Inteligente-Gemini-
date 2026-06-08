import { create } from 'zustand';
import { api } from '@/lib/axios';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'ADMIN' | 'RECRUITER' | 'CANDIDATE';
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;          // loading genérico (para inicialização)
  isLoggingIn: boolean;
  isRegistering: boolean;
  isFetchingMe: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, full_name: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

// Prevenir chamadas concorrentes ao fetchMe
let fetchMePromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  isLoggingIn: false,
  isRegistering: false,
  isFetchingMe: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoggingIn: true, error: null });
    try {
      const { data } = await api.post<{ access_token: string; refresh_token: string }>(
        '/auth/login',
        { email, password }
      );
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      await get().fetchMe();
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Erro ao fazer login. Verifique as credenciais.';
      set({ error: message, isAuthenticated: false, user: null });
      throw new Error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  register: async (email, password, full_name) => {
    set({ isRegistering: true, error: null });
    try {
      await api.post('/auth/register', { email, password, full_name });
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Erro ao registrar. Tente novamente.';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isRegistering: false });
    }
  },

  fetchMe: async () => {
    // Evita múltiplas chamadas simultâneas
    if (fetchMePromise) return fetchMePromise;

    set({ isFetchingMe: true, error: null });
    fetchMePromise = (async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
        fetchMePromise = null;
        return;
      }
      try {
        const { data } = await api.get<User>('/auth/me');
        set({ user: data, isAuthenticated: true, isInitialized: true, isLoading: false });
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
      } finally {
        set({ isFetchingMe: false });
        fetchMePromise = null;
      }
    })();

    return fetchMePromise;
  },

  initialize: async () => {
    if (get().isInitialized) return;
    await get().fetchMe();
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
      isLoggingIn: false,
      isRegistering: false,
      isFetchingMe: false,
      error: null,
    });
    // Opcional: redirecionamento pode ser feito no componente
  },
}));