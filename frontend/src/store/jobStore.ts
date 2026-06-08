import { create } from 'zustand';
import { api } from '@/lib/axios';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  education_level: string | null;
  experience_years: number;
  status: 'OPEN' | 'CLOSED';
  required_skills: string[];
  created_at: string;
  updated_at: string;
}

export interface JobCreateData {
  title: string;
  description: string;
  education_level?: string;
  experience_years: number;
  required_skills: string[];
}

export interface JobUpdateData {
  title?: string;
  description?: string;
  education_level?: string;
  experience_years?: number;
  required_skills?: string[];
}

export interface CandidateRanking {
  candidate_id: string;
  candidate_name: string;
  application_id: string;
  compatibility_score: number;
  justification: string;
  skills: string[];
}

interface JobState {
  // Estado
  jobs: Job[];
  currentJob: Job | null;
  candidates: CandidateRanking[];
  isLoading: boolean;
  error: string | null;

  // Ações CRUD
  fetchJobs: (force?: boolean) => Promise<void>;
  fetchJob: (id: string) => Promise<void>;
  createJob: (data: JobCreateData) => Promise<Job>;
  updateJob: (id: string, data: JobUpdateData) => Promise<void>;
  closeJob: (id: string) => Promise<void>;

  // Rankings
  fetchCandidates: (jobId: string) => Promise<void>;

  // Helpers
  clearError: () => void;
  clearCurrentJob: () => void;
  updateJobInList: (updatedJob: Job) => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Cache control
// ---------------------------------------------------------------------------
let jobsFetchPromise: Promise<void> | null = null;
let lastJobsFetch = 0;
const JOBS_STALE_MS = 30_000; // 30 segundos

let candidatesFetchPromise: { [jobId: string]: Promise<void> | null } = {};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useJobStore = create<JobState>()((set, get) => ({
  jobs: [],
  currentJob: null,
  candidates: [],
  isLoading: false,
  error: null,

  /**
   * Carrega a lista de vagas.
   * Se `force` for false e os dados tiverem sido carregados há menos de 30s,
   * utiliza a cache sem nova requisição.
   */
  fetchJobs: async (force = false) => {
    const now = Date.now();
    const { jobs } = get();

    // Cache válido
    if (!force && lastJobsFetch && now - lastJobsFetch < JOBS_STALE_MS && jobs.length > 0) {
      return;
    }

    // Evita chamadas concorrentes
    if (jobsFetchPromise) return jobsFetchPromise;

    set({ isLoading: true, error: null });
    jobsFetchPromise = (async () => {
      try {
        const { data } = await api.get<Job[]>('/jobs');
        set({ jobs: data, isLoading: false, error: null });
        lastJobsFetch = Date.now();
      } catch (err: unknown) {
        const message =
          (err as any)?.response?.data?.detail ||
          (err as any)?.message ||
          'Erro ao carregar vagas';
        set({ error: message, isLoading: false });
      } finally {
        jobsFetchPromise = null;
      }
    })();

    return jobsFetchPromise;
  },

  /**
   * Carrega os detalhes de uma vaga específica.
   * Se a vaga já for a `currentJob` e não houver erro, evita nova requisição.
   */
  fetchJob: async (id: string) => {
    const { currentJob } = get();
    if (currentJob?.id === id && !get().error) return;

    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<Job>(`/jobs/${id}`);
      set({ currentJob: data, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.message ||
        'Erro ao carregar detalhes da vaga';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * Cria uma nova vaga.
   * Retorna o objeto Job criado.
   * Atualiza a lista local e invalida a cache de jobs.
   */
  createJob: async (jobData: JobCreateData): Promise<Job> => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<Job>('/jobs', jobData);
      set(state => ({
        jobs: [data, ...state.jobs],
        isLoading: false,
      }));
      // Invalida cache para forçar refresh na próxima chamada
      lastJobsFetch = 0;
      return data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.message ||
        'Erro ao criar vaga';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Atualiza parcialmente uma vaga existente.
   * Atualiza a lista local e o `currentJob` se for a mesma vaga.
   * Invalida a cache.
   */
  updateJob: async (id: string, jobData: JobUpdateData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put<Job>(`/jobs/${id}`, jobData);
      set(state => ({
        jobs: state.jobs.map(j => (j.id === id ? data : j)),
        currentJob: state.currentJob?.id === id ? data : state.currentJob,
        isLoading: false,
      }));
      lastJobsFetch = 0;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.message ||
        'Erro ao atualizar vaga';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Encerra uma vaga (status CLOSED).
   * Atualiza a lista local e o `currentJob`.
   */
  closeJob: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.patch<Job>(`/jobs/${id}/close`);
      set(state => ({
        jobs: state.jobs.map(j => (j.id === id ? data : j)),
        currentJob: state.currentJob?.id === id ? data : state.currentJob,
        isLoading: false,
      }));
      lastJobsFetch = 0;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.message ||
        'Erro ao encerrar vaga';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  /**
   * Carrega a lista de candidatos ranqueados para uma vaga.
   * Previne chamadas concorrentes para a mesma vaga.
   */
  fetchCandidates: async (jobId: string) => {
    // Evita chamadas concorrentes para o mesmo jobId
    if (candidatesFetchPromise[jobId]) return candidatesFetchPromise[jobId];

    set({ isLoading: true, error: null });
    candidatesFetchPromise[jobId] = (async () => {
      try {
        const { data } = await api.get<CandidateRanking[]>(`/jobs/${jobId}/candidates`);
        set({ candidates: data, isLoading: false });
      } catch (err: unknown) {
        const message =
          (err as any)?.response?.data?.detail ||
          (err as any)?.message ||
          'Erro ao carregar candidatos';
        set({ error: message, isLoading: false });
      } finally {
        candidatesFetchPromise[jobId] = null;
      }
    })();

    return candidatesFetchPromise[jobId];
  },

  // ---------- Helpers ----------

  clearError: () => set({ error: null }),
  clearCurrentJob: () => set({ currentJob: null }),
  updateJobInList: (updatedJob: Job) =>
    set(state => ({
      jobs: state.jobs.map(j => (j.id === updatedJob.id ? updatedJob : j)),
    })),
  reset: () =>
    set({
      jobs: [],
      currentJob: null,
      candidates: [],
      isLoading: false,
      error: null,
    }),
}));