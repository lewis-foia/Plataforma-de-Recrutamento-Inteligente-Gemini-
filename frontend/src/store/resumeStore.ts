import { create } from 'zustand';
import { api } from '@/lib/axios';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface Resume {
  id: string;
  candidate_id: string;
  original_filename: string;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  parsed_data: Record<string, unknown> | null;
  uploaded_at: string;
}

interface ResumeState {
  resumes: Resume[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;

  uploadResume: (file: File) => Promise<Resume>;
  fetchResumes: (force?: boolean) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Cache control
let fetchResumesPromise: Promise<void> | null = null;
let lastFetchResumes = 0;
const RESUMES_STALE_MS = 30_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validateFile = (file: File): void => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Apenas ficheiros PDF ou DOCX são permitidos.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('O ficheiro excede o tamanho máximo de 10MB.');
  }
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useResumeStore = create<ResumeState>()((set, get) => ({
  resumes: [],
  isLoading: false,
  isUploading: false,
  error: null,

  /**
   * Carrega a lista de currículos do candidato autenticado.
   * Utiliza cache de 30 segundos (a menos que force=true).
   * Previne chamadas concorrentes.
   */
  fetchResumes: async (force = false) => {
    const now = Date.now();
    const { resumes } = get();

    // Cache válido
    if (!force && lastFetchResumes && now - lastFetchResumes < RESUMES_STALE_MS && resumes.length > 0) {
      return;
    }

    // Evita chamadas concorrentes
    if (fetchResumesPromise) return fetchResumesPromise;

    set({ isLoading: true, error: null });
    fetchResumesPromise = (async () => {
      try {
        const { data } = await api.get<Resume[]>('/resumes');
        set({ resumes: data, isLoading: false, error: null });
        lastFetchResumes = Date.now();
      } catch (err: unknown) {
        const message =
          (err as any)?.response?.data?.detail ||
          (err as any)?.message ||
          'Erro ao carregar currículos';
        set({ error: message, isLoading: false });
      } finally {
        fetchResumesPromise = null;
      }
    })();

    return fetchResumesPromise;
  },

  /**
   * Faz upload de um currículo (PDF/DOCX).
   * Valida o ficheiro antes de enviar.
   * Após sucesso, atualiza a lista local e invalida a cache.
   */
  uploadResume: async (file: File): Promise<Resume> => {
    validateFile(file);

    set({ isUploading: true, error: null });

    const form = new FormData();
    form.append('file', file);

    try {
      const { data } = await api.post<Resume>('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Atualiza lista local optimistamente
      set(state => ({
        resumes: [data, ...state.resumes],
        isUploading: false,
      }));

      // Invalida cache para forçar refresh na próxima chamada
      lastFetchResumes = 0;

      // Sincroniza com o servidor (sem bloquear)
      get().fetchResumes(true).catch(() => {});

      return data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.detail ||
        (err as any)?.message ||
        'Erro ao enviar currículo';
      set({ error: message, isUploading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      resumes: [],
      isLoading: false,
      isUploading: false,
      error: null,
    }),
}));