import { create } from 'zustand'
import { api } from '@/lib/axios'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Representação de uma vaga na listagem e detalhes */
export interface Job {
  id: string
  recruiter_id: string
  title: string
  description: string
  education_level: string | null
  experience_years: number
  status: 'OPEN' | 'CLOSED'
  required_skills: string[]
  created_at: string
  updated_at: string
}

/** Dados de criação de uma nova vaga */
export interface JobCreateData {
  title: string
  description: string
  education_level?: string
  experience_years: number
  required_skills: string[]
}

/** Dados de atualização parcial de uma vaga */
export interface JobUpdateData {
  title?: string
  description?: string
  education_level?: string
  experience_years?: number
  required_skills?: string[]
}

/** Candidato ranqueado para uma vaga específica */
export interface CandidateRanking {
  candidate_id: string
  candidate_name: string
  application_id: string
  compatibility_score: number
  justification: string
  skills: string[]
}

/** Estado e ações da store de vagas */
interface JobState {
  // ---------- Estado ----------
  jobs: Job[]
  currentJob: Job | null
  candidates: CandidateRanking[]
  isLoading: boolean
  error: string | null

  // ---------- Ações CRUD ----------
  fetchJobs: () => Promise<void>
  fetchJob: (id: string) => Promise<void>
  createJob: (data: JobCreateData) => Promise<Job>
  updateJob: (id: string, data: JobUpdateData) => Promise<void>
  closeJob: (id: string) => Promise<void>

  // ---------- Rankings ----------
  fetchCandidates: (jobId: string) => Promise<void>

  // ---------- Helpers ----------
  clearError: () => void
  clearCurrentJob: () => void
  updateJobInList: (updatedJob: Job) => void
}

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
   * Carrega a lista de vagas abertas.
   * Substitui totalmente o array `jobs`.
   */
  fetchJobs: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<Job[]>('/jobs')
      set({ jobs: data, isLoading: false })
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Erro ao carregar vagas'
      set({ error: message, isLoading: false })
    }
  },

  /**
   * Carrega os detalhes de uma vaga específica.
   */
  fetchJob: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<Job>(`/jobs/${id}`)
      set({ currentJob: data, isLoading: false })
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Erro ao carregar detalhes da vaga'
      set({ error: message, isLoading: false })
    }
  },

  /**
   * Cria uma nova vaga.
   * Retorna o objeto Job criado.
   * Atualiza a lista de vagas localmente para evitar uma nova requisição.
   */
  createJob: async (jobData: JobCreateData): Promise<Job> => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post<Job>('/jobs', jobData)
      set(state => ({ jobs: [data, ...state.jobs], isLoading: false }))
      return data
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Erro ao criar vaga'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * Atualiza parcialmente uma vaga existente.
   * Atualiza a lista local e o `currentJob` se for a mesma vaga.
   */
  updateJob: async (id: string, jobData: JobUpdateData) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.put<Job>(`/jobs/${id}`, jobData)
      set(state => ({
        jobs: state.jobs.map(j => (j.id === id ? data : j)),
        currentJob: state.currentJob?.id === id ? data : state.currentJob,
        isLoading: false,
      }))
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Erro ao atualizar vaga'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * Encerra uma vaga (status CLOSED).
   * Atualiza a lista local e o `currentJob` se for a mesma vaga.
   */
  closeJob: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.patch<Job>(`/jobs/${id}/close`)
      set(state => ({
        jobs: state.jobs.map(j => (j.id === id ? data : j)),
        currentJob: state.currentJob?.id === id ? data : state.currentJob,
        isLoading: false,
      }))
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Erro ao encerrar vaga'
      set({ error: message, isLoading: false })
      throw err
    }
  },

  /**
   * Carrega a lista de candidatos ranqueados para uma vaga específica.
   */
  fetchCandidates: async (jobId: string) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<CandidateRanking[]>(`/jobs/${jobId}/candidates`)
      set({ candidates: data, isLoading: false })
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Erro ao carregar candidatos'
      set({ error: message, isLoading: false })
    }
  },

  // ---------- Helpers ----------

  /** Limpa o erro actual */
  clearError: () => set({ error: null }),

  /** Remove o currentJob (útil ao desmontar componente) */
  clearCurrentJob: () => set({ currentJob: null }),

  /** Atualiza uma vaga na lista local sem fazer requisição */
  updateJobInList: (updatedJob: Job) =>
    set(state => ({
      jobs: state.jobs.map(j => (j.id === updatedJob.id ? updatedJob : j)),
    })),
}))