// src/pages/DashboardPage.tsx
import { useEffect } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import CompatibilityChart from '@/components/charts/CompatibilityChart';
import MetricCard from '@/components/ui/MetricCard';
import Spinner from '@/components/ui/Spinner';
import { Users, Briefcase, FileText, Star, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { metrics, isLoading, fetchMetrics } = useDashboardStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchMetrics();
  }, [user, fetchMetrics]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Bem-vindo(a)!</h2>
          <p className="text-gray-500 mt-2 text-sm">
            Utilize o menu lateral para aceder às funcionalidades.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) return <Spinner centered text="A carregar métricas..." />;

  const totalCandidates = metrics?.total_candidates ?? 0;
  const totalJobs = metrics?.total_jobs ?? 0;
  const totalApplications = metrics?.total_applications ?? 0;
  const avgCompatibility = metrics?.avg_compatibility ?? 0;
  const approved = metrics?.approved_applications ?? 0;
  const rejected = metrics?.rejected_applications ?? 0;
  const pending = totalApplications - approved - rejected;

  // Fallback para dados do gráfico de compatibilidade
  const compatibilityData = metrics?.compatibility_distribution && metrics.compatibility_distribution.length > 0
    ? metrics.compatibility_distribution
    : [
        { range: '0-20', count: 0 },
        { range: '21-40', count: 0 },
        { range: '41-60', count: 0 },
        { range: '61-80', count: 0 },
        { range: '81-100', count: 0 },
      ];

  const recentActivities = [
    { name: 'João Silva', action: 'Candidatou-se a Desenvolvedor Frontend', time: '10:30' },
    { name: 'Maria Santos', action: 'Atualizou o perfil', time: '09:45' },
    { name: 'Carlos Lima', action: 'Nova vaga criada: DevOps', time: '08:15' },
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral do desempenho da plataforma de recrutamento.
        </p>
      </div>

      {/* Cards coloridos com animações */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Candidatos"
          value={totalCandidates}
          icon={<Users size={22} />}
          color="blue"
        />
        <MetricCard
          title="Vagas Ativas"
          value={totalJobs}
          icon={<Briefcase size={22} />}
          color="green"
        />
        <MetricCard
          title="Candidaturas"
          value={totalApplications}
          icon={<FileText size={22} />}
          color="purple"
        />
        <MetricCard
          title="Compatibilidade Média"
          value={`${avgCompatibility}%`}
          icon={<Star size={22} />}
          color="amber"
          trend={{ value: 5, label: 'vs mês anterior' }}
        />
      </div>

      {/* Gráfico e resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Distribuição de Compatibilidade
          </h3>
          <CompatibilityChart data={compatibilityData} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            Status das Candidaturas
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="font-medium text-gray-700">Aprovadas</span>
              </div>
              <span className="text-xl font-bold text-green-600">{approved}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-red-600" />
                <span className="font-medium text-gray-700">Rejeitadas</span>
              </div>
              <span className="text-xl font-bold text-red-600">{rejected}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-500" />
                <span className="font-medium text-gray-700">Pendentes</span>
              </div>
              <span className="text-xl font-bold text-gray-600">{pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-2">
          <h3 className="text-base font-semibold text-gray-900">Atividades Recentes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-800">{activity.name}</p>
                <p className="text-sm text-gray-500">{activity.action}</p>
              </div>
              <p className="text-sm text-gray-400">{activity.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}