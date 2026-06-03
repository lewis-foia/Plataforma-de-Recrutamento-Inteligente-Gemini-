import { create } from 'zustand'
import { api } from '@/lib/axios'

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Representação de um currículo enviado */
export interface Resume {
  id: string
  candidate_id: string
  original_filename: string
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED'
  parsed_data: Record<string, unknown> | null
  uploaded_at: string
}

/** Estado e ações da store de currículos */
interface ResumeState {
  // ---------- Estado ----------
  resumes: Resume[]
  isLoading: boolean
  isUploading: boolean
  error: string | null

  // ---------- Ações ----------
  uploadResume: (file: File) => Promise<Resume>
  fetchResumes: () => Promise<void>
  clearError: () => void
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Tipos MIME permitidos para upload */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

/** Tamanho máximo de ficheiro (10MB) */
const MAX_FILE_SIZE = 10 * 1024 * 1024

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Valida o ficheiro antes do upload.
 * Lança um erro com mensagem amigável se a validação falhar.
 */
const validateFile = (file: File): void => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Apenas ficheiros PDF ou DOCX são permitidos.')
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('O ficheiro excede o tamanho máximo de 10MB.')
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useResumeStore = create<ResumeState>()((set, get) => ({
  resumes: [],
  isLoading: false,
  isUploading: false,
  error: null,

  /**
   * Faz upload de um currículo (PDF/DOCX).
   * Valida o ficheiro antes de enviar.
   * Após sucesso, atualiza automaticamente a lista de currículos.
   */
  uploadResume: async (file: File): Promise<Resume> => {
    // Validação local antes do envio
    validateFile(file)

    set({ isUploading: true, error: null })

    const form = new FormData()
    form.append('file', file)

    try {
      const { data } = await api.post<Resume>('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Atualiza a lista local sem esperar pela requisição completa
      set(state => ({
        resumes: [data, ...state.resumes],
        isUploading: false,
      }))

      // Sincroniza com o servidor para garantir consistência
      await get().fetchResumes()
      return data
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Erro ao enviar currículo'
      set({ error: message, isUploading: false })
      throw err
    }
  },

  /**
   * Carrega a lista de currículos do candidato autenticado.
   */
  fetchResumes: async () => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.get<Resume[]>('/resumes')
      set({ resumes: data, isLoading: false })
    } catch (err: any) {
      const message =
        err?.response?.data?.detail || err?.message || 'Erro ao carregar currículos'
      set({ error: message, isLoading: false })
    }
  },

  /** Limpa o erro actual */
  clearError: () => set({ error: null }),
}))