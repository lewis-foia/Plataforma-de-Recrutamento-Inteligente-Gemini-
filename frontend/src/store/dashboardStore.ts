import { create } from 'zustand'
import { api } from '@/lib/axios'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Distribuição de compatibilidade (range → quantidade de candidaturas) */
interface CompatibilityDist {
  range: string
  count: number
}

/** Métricas do dashboard (apenas admin) */
interface Metrics {
  total_candidates: number
  total_jobs: number
  total_applications: number
  approved_applications: number
  rejected_applications: number
  avg_compatibility: number
  compatibility_distribution: CompatibilityDist[]
}

/** Estado e ações da store do dashboard */
interface DashboardState {
  metrics: Metrics | null
  isLoading: boolean
  error: string | null
  lastFetch: number | null // timestamp da última actualização bem‑sucedida

  fetchMetrics: (force?: boolean) => Promise<void>
  clearError: () => void
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Tempo mínimo (ms) entre duas requisições sucessivas (sem force) */
const MIN_STALE_TIME = 30_000

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  metrics: null,
  isLoading: false,
  error: null,
  lastFetch: null,

  /**
   * Carrega as métricas globais do dashboard.
   * Se os dados já tiverem sido carregados há menos de MIN_STALE_TIME
   * e `force` não for true, retorna os dados em cache sem nova requisição.
   */
  fetchMetrics: async (force = false) => {
    const { lastFetch } = get()
    const now = Date.now()

    // Evita requisições desnecessárias se os dados forem recentes
    if (!force && lastFetch && now - lastFetch < MIN_STALE_TIME) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      const { data } = await api.get<Metrics>('/dashboard/metrics')
      set({
        metrics: data,
        isLoading: false,
        lastFetch: now,
      })
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Erro ao carregar métricas'
      set({ error: message, isLoading: false })
    }
  },

  /** Limpa o erro actual, útil ao sair da página ou ao tentar novamente */
  clearError: () => set({ error: null }),
}))