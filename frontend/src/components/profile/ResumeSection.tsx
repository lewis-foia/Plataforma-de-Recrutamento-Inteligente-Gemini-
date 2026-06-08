import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/resumeStore';
import { Upload, FileText, FileCheck, FileWarning, FileClock, RefreshCw, Eye, ChevronUp } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';

export default function ResumeSection() {
  const { resumes, isLoading, uploadResume, fetchResumes } = useResumeStore();
  const [uploading, setUploading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return;
    setUploading(true);
    try { await uploadResume(files[0]); toast.success('Currículo enviado!'); fetchResumes(); } 
    catch (e: any) { toast.error(e.response?.data?.detail || 'Erro'); } 
    finally { setUploading(false); }
  }, [uploadResume, fetchResumes]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }, maxFiles: 1, maxSize: 10 * 1024 * 1024 });
  const statusConfig: any = { PENDING: { icon: FileClock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pendente' }, PROCESSING: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Processando' }, PROCESSED: { icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Processado' }, FAILED: { icon: FileWarning, color: 'text-red-600', bg: 'bg-red-50', label: 'Falhou' } };

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}>
        <input {...getInputProps()} />
        {uploading ? <Spinner /> : <><Upload className="mx-auto text-gray-400 mb-2" size={28} /><p className="text-gray-600">Arraste ou clique para enviar</p><p className="text-xs text-gray-400">PDF/DOCX até 10MB</p></>}
      </div>
      {isLoading ? <Spinner /> : resumes.map(r => {
        const config = statusConfig[r.status] || statusConfig.PENDING;
        const Icon = config.icon;
        const isExpanded = expandedId === r.id;
        return (
          <div key={r.id} className="bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center p-3"><div className="flex items-center gap-2"><FileText size={18} className="text-gray-500" /><div><p className="text-sm font-medium">{r.original_filename}</p><p className="text-xs text-gray-400">{new Date(r.uploaded_at).toLocaleDateString()}</p></div></div><div className="flex items-center gap-2"><span className={`px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}><Icon size={12} className="inline mr-1" />{config.label}</span>{r.status === 'PROCESSED' && <button onClick={() => setExpandedId(isExpanded ? null : r.id)}>{isExpanded ? <ChevronUp size={16} /> : <Eye size={16} />}</button>}</div></div>
            {isExpanded && r.parsed_data && (<div className="border-t border-gray-200 p-3 space-y-2 text-sm"> {r.parsed_data.full_name && <p><strong>Nome:</strong> {r.parsed_data.full_name}</p>} {r.parsed_data.email && <p><strong>Email:</strong> {r.parsed_data.email}</p>} {r.parsed_data.skills && <p><strong>Skills:</strong> {r.parsed_data.skills.join(', ')}</p>}</div>)}
          </div>
        );
      })}
    </div>
  );
}