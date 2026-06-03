import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { useResumeStore } from '@/store/resumeStore'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Upload, FileText, FileCheck, FileWarning, FileClock, Cloud, RefreshCw, ArrowUp, Eye, ChevronDown, ChevronUp, User, Mail, Phone, GraduationCap, Briefcase, Award, Globe } from 'lucide-react'

export default function UploadResumePage() {
  const { resumes, isLoading, uploadResume, fetchResumes } = useResumeStore()
  const [uploading, setUploading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useState(() => { fetchResumes() }, [])

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return
    setUploading(true)
    try {
      await uploadResume(files[0])
      toast.success('Currículo enviado com sucesso!')
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erro ao enviar currículo')
    } finally {
      setUploading(false)
    }
  }, [uploadResume])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const statusConfig: Record<string, { icon: typeof FileCheck; variant: 'success' | 'danger' | 'warning' | 'info' | 'default'; label: string }> = {
    PENDING: { icon: FileClock, variant: 'warning', label: 'Pendente' },
    PROCESSING: { icon: RefreshCw, variant: 'info', label: 'Processando' },
    PROCESSED: { icon: FileCheck, variant: 'success', label: 'Processado' },
    FAILED: { icon: FileWarning, variant: 'danger', label: 'Falhou' },
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Upload size={24} className="text-primary-600" />
          Upload de Currículo
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Envie seu currículo em PDF ou DOCX para análise automática com IA.
        </p>
      </div>

      {/* Área de upload */}
      <Card className="shadow-sm border border-gray-200/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Cloud size={18} className="text-primary-500" />
            Enviar arquivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200
              ${isDragActive ? 'border-primary-500 bg-primary-50/50 scale-[1.01] shadow-lg shadow-primary-100' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
              ${uploading ? 'pointer-events-none opacity-70' : ''}`}
          >
            <input {...getInputProps()} />
            <div className={`mb-4 transition-transform duration-300 ${isDragActive ? 'scale-110' : ''}`}>
              {uploading ? (
                <div className="w-14 h-14 mx-auto border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              ) : (
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto transition-colors ${isDragActive ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Upload size={28} className={isDragActive ? 'text-primary-600' : 'text-gray-400'} />
                </div>
              )}
            </div>
            {uploading ? (
              <>
                <p className="text-gray-700 font-medium">Enviando currículo...</p>
                <p className="text-xs text-gray-400 mt-1">Isso pode levar alguns segundos</p>
              </>
            ) : isDragActive ? (
              <>
                <p className="text-primary-700 font-medium">Solte o arquivo aqui</p>
                <p className="text-xs text-primary-400 mt-1">PDF ou DOCX (máx. 10MB)</p>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-medium">Arraste e solte seu currículo aqui</p>
                <p className="text-gray-500 text-sm mt-1">ou clique para selecionar</p>
                <p className="text-xs text-gray-400 mt-2">PDF ou DOCX (máx. 10MB)</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de currículos com dados extraídos */}
      <Card className="shadow-sm border border-gray-200/80">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-primary-500" />
            Meus Currículos
          </CardTitle>
          <button onClick={() => fetchResumes()} className="text-xs text-gray-400 hover:text-primary-600 transition-colors flex items-center gap-1">
            <RefreshCw size={12} />
            Atualizar
          </button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Nenhum currículo enviado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map(r => {
                const config = statusConfig[r.status] || statusConfig.PENDING
                const StatusIcon = config.icon
                const isExpanded = expandedId === r.id
                const data = r.parsed_data

                return (
                  <div key={r.id} className="bg-gray-50 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <FileText size={18} className="text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{r.original_filename}</p>
                          <p className="text-xs text-gray-400">{new Date(r.uploaded_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        {r.status === 'PROCESSED' && (
                          <button onClick={() => toggleExpand(r.id)} className="text-gray-400 hover:text-primary-600">
                            {isExpanded ? <ChevronUp size={18} /> : <Eye size={18} />}
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && data && (
                      <div className="px-4 pb-4 border-t border-gray-200 pt-3 space-y-3">
                        {data.full_name && (
                          <div className="flex items-center gap-2 text-sm"><User size={14} className="text-gray-400" /><span className="font-medium">{data.full_name}</span></div>
                        )}
                        {data.email && (
                          <div className="flex items-center gap-2 text-sm"><Mail size={14} className="text-gray-400" /><span>{data.email}</span></div>
                        )}
                        {data.phone && (
                          <div className="flex items-center gap-2 text-sm"><Phone size={14} className="text-gray-400" /><span>{data.phone}</span></div>
                        )}
                        {data.skills?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1"><Briefcase size={14} className="text-gray-400" />Skills</div>
                            <div className="flex flex-wrap gap-1">{data.skills.map((s: string, i: number) => <Badge key={i} variant="info">{s}</Badge>)}</div>
                          </div>
                        )}
                        {data.education?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1"><GraduationCap size={14} className="text-gray-400" />Formação</div>
                            {data.education.map((e: any, i: number) => (
                              <p key={i} className="text-xs text-gray-600">{e.degree} — {e.institution} ({e.year})</p>
                            ))}
                          </div>
                        )}
                        {data.experience?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium mb-1"><Briefcase size={14} className="text-gray-400" />Experiência</div>
                            {data.experience.map((exp: any, i: number) => (
                              <p key={i} className="text-xs text-gray-600">{exp.role} na {exp.company} ({exp.years} anos)</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}