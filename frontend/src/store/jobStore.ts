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
  jobs: Job[];
  currentJob: Job | null;
  candidates: CandidateRanking[];
  isLoading: boolean;
  error: string | null;

  fetchJobs: (force?: boolean) => Promise<void>;
  fetchJob: (id: string) => Promise<void>;
  createJob: (data: JobCreateData) => Promise<Job>;
  updateJob: (id: string, data: JobUpdateData) => Promise<void>;
  closeJob: (id: string) => Promise<void>;
  fetchCandidates: (jobId: string) => Promise<void>;

  clearError: () => void;
  clearCurrentJob: () => void;
  updateJobInList: (updatedJob: Job) => void;
  reset: () => void;
}

// Cache control
let jobsFetchPromise: Promise<void> | null = null;
let lastJobsFetch = 0;
const JOBS_STALE_MS = 30_000;
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

  fetchJobs: async (force = false) => {
    const now = Date.now();
    const { jobs } = get();

    if (!force && lastJobsFetch && now - lastJobsFetch < JOBS_STALE_MS && jobs.length > 0) {
      return;
    }
    if (jobsFetchPromise) return jobsFetchPromise;

    set({ isLoading: true, error: null });
    jobsFetchPromise = (async () => {
      try {
        // ✅ BARRA FINAL
        const { data } = await api.get<Job[]>('/jobs/');
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

  fetchJob: async (id: string) => {
    const { currentJob } = get();
    if (currentJob?.id === id && !get().error) return;

    set({ isLoading: true, error: null });
    try {
      // ✅ BARRA FINAL
      const { data } = await api.get<Job>(`/jobs/${id}/`);
      set({ currentJob: data, isLoading: false });
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.message ||
        'Erro ao carregar detalhes da vaga';
      set({ error: message, isLoading: false });
    }
  },

  createJob: async (jobData: JobCreateData): Promise<Job> => {
    set({ isLoading: true, error: null });
    try {
      // ✅ BARRA FINAL
      const { data } = await api.post<Job>('/jobs/', jobData);
      set(state => ({
        jobs: [data, ...state.jobs],
        isLoading: false,
      }));
      lastJobsFetch = 0; // invalida cache
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

  updateJob: async (id: string, jobData: JobUpdateData) => {
    set({ isLoading: true, error: null });
    try {
      // ✅ BARRA FINAL
      const { data } = await api.put<Job>(`/jobs/${id}/`, jobData);
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

  closeJob: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // ✅ BARRA FINAL
      const { data } = await api.patch<Job>(`/jobs/${id}/close/`);
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

  fetchCandidates: async (jobId: string) => {
    if (candidatesFetchPromise[jobId]) return candidatesFetchPromise[jobId];

    set({ isLoading: true, error: null });
    candidatesFetchPromise[jobId] = (async () => {
      try {
        // ✅ BARRA FINAL
        const { data } = await api.get<CandidateRanking[]>(`/jobs/${jobId}/candidates/`);
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