import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/resumeStore';
import { Upload, FileText, FileCheck, FileWarning, FileClock, RefreshCw, Cloud } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

export default function UploadResumePage() {
  const { resumes, isLoading, uploadResume, fetchResumes } = useResumeStore();
  const [uploading, setUploading] = useState(false);

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
            <p className="text-gray-500 text-sm">Envie seu currículo para análise automática com IA</p>
          </div>
        </div>
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
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50 scale-[1.01]' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }
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
                <p className="text-xs text-gray-400 mt-1">Isso pode levar alguns segundos</p>
              </>
            ) : isDragActive ? (
              <>
                <p className="text-blue-600 font-medium">Solte o arquivo aqui</p>
                <p className="text-xs text-blue-500 mt-1">PDF ou DOCX (máx. 10MB)</p>
              </>
            ) : (
              <>
                <p className="text-gray-700 font-medium">Arraste e solte seu currículo aqui</p>
                <p className="text-gray-500 text-sm mt-1">ou clique para selecionar</p>
                <p className="text-xs text-gray-400 mt-2">PDF ou DOCX (máx. 10MB)</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lista de currículos enviados */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={18} className="text-gray-500" />
            <h3 className="text-base font-medium text-gray-800">Meus Currículos</h3>
            <button
              onClick={() => fetchResumes()}
              className="ml-auto text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1"
            >
              <RefreshCw size={12} /> Atualizar
            </button>
          </div>

          {isLoading ? (
            <Spinner centered />
          ) : resumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText size={40} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">Nenhum currículo enviado ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => {
                const config = statusConfig[resume.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                return (
                  <div key={resume.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{resume.original_filename}</p>
                        <p className="text-xs text-gray-400">{new Date(resume.uploaded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                      <StatusIcon size={12} className="mr-1" />
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}