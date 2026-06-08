import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '@/store/jobStore';
import { useAuthStore } from '@/store/authStore';
import { Briefcase, PlusCircle, Clock, Users, Eye, Phone, Mail, ChevronRight, Search } from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import JobFormModal from '@/components/jobs/JobFormModal';

export default function JobsPage() {
  const { jobs, isLoading, fetchJobs } = useJobStore();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Filtro local por título ou descrição
  const vagasFiltradas = useMemo(() => {
    if (!termoBusca) return jobs;
    const termo = termoBusca.toLowerCase();
    return jobs.filter(job => 
      job.title.toLowerCase().includes(termo) || 
      job.description.toLowerCase().includes(termo)
    );
  }, [jobs, termoBusca]);

  // Métricas reais a partir dos dados da API
  const metricas = useMemo(() => {
    const total = jobs.length;
    const abertas = jobs.filter(j => j.status === 'OPEN').length;
    const totalCandidaturas = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
    return { total, abertas, totalCandidaturas };
  }, [jobs]);

  if (isLoading) return <Spinner centered text="A carregar vagas..." />;

  return (
    <div className="space-y-8">
      {/* SECÇÃO HERO - apenas com campo de busca */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Vagas disponíveis</h1>
        <p className="text-blue-100 mb-6">Encontre a oportunidade ideal para o seu próximo desafio</p>
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por título ou descrição..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full rounded-xl bg-white text-gray-900 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* MÉTRICAS REAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard title="Total de vagas" value={metricas.total} icon={<Briefcase size={22} />} color="blue" />
        <MetricCard title="Vagas abertas" value={metricas.abertas} icon={<Clock size={22} />} color="green" />
        <MetricCard title="Candidaturas totais" value={metricas.totalCandidaturas} icon={<Users size={22} />} color="purple" />
      </div>

      {/* LISTA DE VAGAS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Todas as vagas</h2>
          {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && (
            <Button onClick={() => setShowCreateModal(true)} icon={<PlusCircle size={18} />}>Nova vaga</Button>
          )}
        </div>

        {vagasFiltradas.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl py-12 text-center">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">Nenhuma vaga encontrada</h3>
            <p className="text-gray-500 mt-1">Tente outro termo de pesquisa ou volte mais tarde.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {vagasFiltradas.map(vaga => (
              <div
                key={vaga.id}
                onClick={() => navigate(`/jobs/${vaga.id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-lg">{vaga.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        vaga.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {vaga.status === 'OPEN' ? 'Aberta' : 'Fechada'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vaga.education_level && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{vaga.education_level}</span>
                      )}
                      {vaga.experience_years > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{vaga.experience_years} anos</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-3 line-clamp-2">{vaga.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-gray-400 text-xs">
                      <span className="flex items-center gap-1"><Users size={12} /> {vaga.applications_count || 0} candidaturas</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> ver detalhes</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Briefcase size={16} className="text-gray-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECÇÃO DE AJUDA / CONTACTO (opcional, pode ser removida se não tiver API real) */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-2">Precisa de ajuda?</h3>
            <p className="text-gray-300 text-sm mb-4">Entre em contacto com a nossa equipa de suporte</p>
            <div className="flex items-center gap-3 mb-2">
              <Phone size={18} className="text-blue-400" />
              <span className="text-lg font-semibold">+258 870275070</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-blue-400" />
              <span>suporte@recruitai.com</span>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Button variant="outline" className="!text-white !border-white hover:!bg-white/10" onClick={() => window.location.href = 'mailto:suporte@recruitai.com'}>
              Falar com suporte <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para criar/editar vaga (apenas recrutadores/admin) */}
      <JobFormModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}