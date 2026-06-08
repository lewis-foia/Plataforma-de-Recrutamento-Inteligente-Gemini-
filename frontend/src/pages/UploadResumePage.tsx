import { useCallback, useState, useEffect, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/resumeStore';
import { 
  Upload, FileText, FileCheck, FileWarning, FileClock, Cloud, RefreshCw, 
  Eye, ChevronUp, User, Mail, Phone, GraduationCap, Briefcase, 
  Award, BarChart3, CheckCircle
} from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import Spinner from '@/components/ui/Spinner';

export default function UploadResumePage() {
  const { resumes, isLoading, uploadResume, fetchResumes } = useResumeStore();
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setUploading(true);
    try {
      await uploadResume(files[0]);
      toast.success('Currículo enviado com sucesso!');
      await fetchResumes();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erro ao enviar currículo');
    } finally {
      setUploading(false);
    }
  }, [uploadResume, fetchResumes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    PENDING: { icon: FileClock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pendente' },
    PROCESSING: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processando' },
    PROCESSED: { icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Processado' },
    FAILED: { icon: FileWarning, color: 'text-red-600', bg: 'bg-red-50', label: 'Falhou' },
  };

  const stats = useMemo(() => {
    const total = resumes.length;
    const processed = resumes.filter(r => r.status === 'PROCESSED').length;
    const successRate = total > 0 ? Math.round((processed / total) * 100) : 0;
    return { total, processed, successRate };
  }, [resumes]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Upload size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Submeter Currículo</h2>
            <p className="text-gray-500 text-sm">Envie o seu currículo em PDF ou DOCX para análise automática com IA</p>
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard title="Total de currículos" value={stats.total} icon={<FileText size={22} />} color="blue" />
        <MetricCard title="Processados com sucesso" value={stats.processed} icon={<CheckCircle size={22} />} color="green" />
        <MetricCard title="Taxa de sucesso" value={`${stats.successRate}%`} icon={<Award size={22} />} color="purple" />
      </div>

      {/* Área de upload */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Cloud size={18} className="text-gray-500" />
            <h3 className="text-base font-medium text-gray-800">Enviar arquivo</h3>
          </div>
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
              ${isDragActive ? 'border-blue-400 bg-blue-50 scale-[1.01]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
              ${uploading ? 'pointer-events-none opacity-70' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className={`mb-4 transition-transform ${isDragActive ? 'scale-110' : ''}`}>
              {uploading ? (
                <Spinner size="md" />
              ) : (
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Upload size={28} className={isDragActive ? 'text-blue-600' : 'text-gray-500'} />
                </div>
              )}
            </div>
            {uploading ? (
              <>
                <p className="text-gray-700 font-medium">Enviando currículo...</p>
                <p className="text-xs text-gray-400 mt-1">A análise pode levar alguns segundos</p>
              </>
            ) : isDragActive ? (
              <>
                <p className="text-blue-600 font-medium">Solte o arquivo aqui</p>
                <p className="text-xs text-blue-500 mt-1">PDF ou DOCX (máx. 10MB)</p>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-medium">Arraste e solte o seu currículo aqui</p>
                <p className="text-gray-500 text-sm mt-1">ou clique para selecionar</p>
                <p className="text-xs text-gray-400 mt-2">PDF ou DOCX (máx. 10MB)</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lista de currículos */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-500" />
              <h3 className="text-base font-medium text-gray-800">Meus Currículos</h3>
            </div>
            <button onClick={() => fetchResumes()} className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 text-xs">
              <RefreshCw size={12} /> Atualizar
            </button>
          </div>

          {isLoading ? (
            <Spinner centered />
          ) : resumes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <FileText size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">Nenhum currículo enviado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((r) => {
                const config = statusConfig[r.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                const isExpanded = expandedId === r.id;
                const data = r.parsed_data;

                return (
                  <div key={r.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 transition-all hover:shadow-sm">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                          <FileText size={18} className="text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{r.original_filename}</p>
                          <p className="text-xs text-gray-400">{new Date(r.uploaded_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <StatusIcon size={12} className="mr-1" /> {config.label}
                        </span>
                        {r.status === 'PROCESSED' && (
                          <button onClick={() => toggleExpand(r.id)} className="text-gray-500 hover:text-gray-700">
                            {isExpanded ? <ChevronUp size={18} /> : <Eye size={18} />}
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && data && (
                      <div className="px-4 pb-4 border-t border-gray-200 pt-3 space-y-3 bg-white">
                        {data.full_name && <div className="flex items-center gap-2 text-sm text-gray-700"><User size={14} className="text-gray-400" /><span className="font-medium">{data.full_name}</span></div>}
                        {data.email && <div className="flex items-center gap-2 text-sm text-gray-700"><Mail size={14} className="text-gray-400" /><span>{data.email}</span></div>}
                        {data.phone && <div className="flex items-center gap-2 text-sm text-gray-700"><Phone size={14} className="text-gray-400" /><span>{data.phone}</span></div>}
                        {data.skills?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><Briefcase size={14} className="text-gray-400" /> Competências</div>
                            <div className="flex flex-wrap gap-1">{data.skills.map((s: string, i: number) => (<span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs">{s}</span>))}</div>
                          </div>
                        )}
                        {data.education?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1"><GraduationCap size={14} className="text-gray-400" /> Formação</div>
                            {data.education.map((e: any, i: number) => (<p key={i} className="text-xs text-gray-600">{e.degree} — {e.institution} ({e.year})</p>))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {resumes.length > 0 && (
        <div className="flex justify-between items-center text-gray-400 text-xs border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2"><Award size={14} /><span>Análise por inteligência artificial</span></div>
          <div className="flex items-center gap-2"><BarChart3 size={14} /><span>Taxa de processamento: {stats.successRate}%</span></div>
        </div>
      )}
    </div>
  );
}