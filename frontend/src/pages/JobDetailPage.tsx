import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobStore } from '@/store/jobStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { Calendar, Briefcase, Users, ArrowLeft, Clock, GraduationCap, Award, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import CandidatesList from '@/components/jobs/CandidatesList';

export default function JobDetailPage() {
  const { id } = useParams();
  const { currentJob, isLoading, fetchJob, closeJob, fetchCandidates } = useJobStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'candidates'>('details');

  useEffect(() => { if (id) fetchJob(id); }, [id, fetchJob]);
  useEffect(() => { if (id && activeTab === 'candidates') fetchCandidates(id); }, [id, activeTab, fetchCandidates]);

  const handleApply = async () => {
    try { await api.post('/applications', { job_id: id }); toast.success('Candidatura realizada!'); } 
    catch (e: any) { toast.error(e.response?.data?.detail || 'Erro'); }
  };
  const handleClose = async () => {
    if (!id) return;
    try { await closeJob(id); toast.success('Vaga encerrada!'); fetchJob(id); } 
    catch { toast.error('Erro ao encerrar vaga'); }
  };

  if (isLoading) return <Spinner centered text="A carregar detalhes..." />;
  if (!currentJob) return <div className="text-center py-12">Vaga não encontrada.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700"><ArrowLeft size={16} /> Voltar</button>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div><h1 className="text-2xl font-bold text-gray-900">{currentJob.title}</h1><div className="flex flex-wrap gap-2 mt-2">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${currentJob.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{currentJob.status === 'OPEN' ? 'Aberta' : 'Fechada'}</span>
              {currentJob.education_level && <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs"><GraduationCap size={12} className="inline mr-1" />{currentJob.education_level}</span>}
              {currentJob.experience_years > 0 && <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs"><Clock size={12} className="inline mr-1" />{currentJob.experience_years} anos</span>}
            </div></div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center"><Briefcase size={22} className="text-blue-600" /></div>
          </div>
          <div className="border-b border-gray-200 mt-6"><nav className="flex gap-6"><button onClick={() => setActiveTab('details')} className={`pb-2 text-sm font-medium ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Detalhes</button><button onClick={() => setActiveTab('candidates')} className={`pb-2 text-sm font-medium ${activeTab === 'candidates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Candidatos</button></nav></div>
          <div className="mt-6">{activeTab === 'details' ? (<div className="space-y-4"><div><h4 className="text-sm font-medium text-gray-700 mb-2">Descrição</h4><p className="text-gray-800 whitespace-pre-wrap">{currentJob.description}</p></div>{(currentJob as any).required_skills?.length > 0 && (<div><h4 className="text-sm font-medium text-gray-700 mb-2">Habilidades</h4><div className="flex flex-wrap gap-1.5">{(currentJob as any).required_skills.map((s: string, i: number) => <span key={i} className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs">{s}</span>)}</div></div>)}<div className="flex items-center gap-2 text-xs text-gray-400 pt-3 border-t border-gray-100"><Calendar size={12} /> Publicada em {new Date(currentJob.created_at).toLocaleDateString()}</div></div>) : <CandidatesList jobId={id!} />}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {user?.role === 'CANDIDATE' && currentJob.status === 'OPEN' && <Button onClick={handleApply} icon={<Briefcase size={18} />}>Candidatar-se</Button>}
        {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && currentJob.status === 'OPEN' && <Button variant="danger" onClick={handleClose}>Encerrar Vaga</Button>}
      </div>
      <div className="flex justify-between items-center text-gray-400 text-xs border-t border-gray-200 pt-4"><div className="flex items-center gap-2"><Award size={14} /><span>Vaga publicada com IA</span></div><div className="flex items-center gap-2"><BarChart3 size={14} /><span>Match automático</span></div></div>
    </div>
  );
}