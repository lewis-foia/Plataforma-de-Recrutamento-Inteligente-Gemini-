import { create } from 'zustand';
import { api } from '@/lib/axios';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Distribuição de compatibilidade (range → quantidade de candidaturas) */
export interface CompatibilityDist {
  range: string;
  count: number;
}

/** Métricas do dashboard (apenas admin) */
export interface Metrics {
  total_candidates: number;
  total_jobs: number;
  total_applications: number;
  approved_applications: number;
  rejected_applications: number;
  avg_compatibility: number;
  compatibility_distribution: CompatibilityDist[];
}

/** Estado e ações da store do dashboard */
interface DashboardState {
  metrics: Metrics | null;
  isLoading: boolean;
  isRefreshing: boolean;    // true quando é um refresh manual (force=true)
  error: string | null;
  lastFetch: number | null; // timestamp da última actualização bem‑sucedida
  lastError: number | null; // timestamp do último erro

  fetchMetrics: (force?: boolean) => Promise<void>;
  refresh: () => Promise<void>; // atalho para force=true
  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Tempo mínimo (ms) entre duas requisições sucessivas (sem force) */
const MIN_STALE_TIME = 30_000;

// Prevenir chamadas concorrentes
let fetchPromise: Promise<void> | null = null;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useDashboardStore = create<DashboardState>()((set, get) => ({
  metrics: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetch: null,
  lastError: null,

  /**
   * Carrega as métricas globais do dashboard.
   * Se os dados já tiverem sido carregados há menos de MIN_STALE_TIME
   * e `force` não for true, retorna os dados em cache sem nova requisição.
   */
  fetchMetrics: async (force = false) => {
    const { lastFetch, isLoading, isRefreshing } = get();
    const now = Date.now();

    // Evita requisições desnecessárias se os dados forem recentes e não for force
    if (!force && lastFetch && now - lastFetch < MIN_STALE_TIME) {
      return;
    }

    // Evita múltiplas chamadas concorrentes
    if (fetchPromise) {
      return fetchPromise;
    }

    // Define estados de loading apropriados
    const isManualRefresh = force;
    set({
      isLoading: !isManualRefresh && !isLoading,
      isRefreshing: isManualRefresh,
      error: null,
    });

    fetchPromise = (async () => {
      try {
        const { data } = await api.get<Metrics>('/dashboard/metrics');
        set({
          metrics: data,
          isLoading: false,
          isRefreshing: false,
          lastFetch: Date.now(),
          lastError: null,
        });
      } catch (err: any) {
        const message =
          err?.response?.data?.detail ||
          err?.message ||
          'Erro ao carregar métricas';
        set({
          error: message,
          isLoading: false,
          isRefreshing: false,
          lastError: Date.now(),
        });
        // Rejeitamos para que os componentes possam capturar o erro
        throw new Error(message);
      } finally {
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  },

  /** Atalho para recarregar forçadamente (útil para botão de refresh) */
  refresh: async () => {
    await get().fetchMetrics(true);
  },

  /** Limpa o erro actual, útil ao sair da página ou ao tentar novamente */
  clearError: () => set({ error: null }),
}));