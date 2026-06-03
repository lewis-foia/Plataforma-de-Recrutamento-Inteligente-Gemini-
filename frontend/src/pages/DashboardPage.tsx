import { useEffect } from 'react'
import { useDashboardStore } from '@/store/dashboardStore'
import { useAuthStore } from '@/store/authStore'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import CompatibilityChart from '@/components/charts/CompatibilityChart'
import { Users, Briefcase, FileText, Star, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  const { metrics, isLoading, fetchMetrics } = useDashboardStore()
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchMetrics()
  }, [user, fetchMetrics])

  // Tela para não-admin
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-200">
          <BarChart3 size={36} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Bem-vindo(a)!</h2>
        <p className="text-gray-500 mt-2 max-w-sm">
          Utilize o menu lateral para aceder às funcionalidades da plataforma.
        </p>
      </div>
    )
  }

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">A carregar métricas...</p>
        </div>
      </div>
    )
  }

  // Configuração dos cards de estatísticas
  const stats = [
    {
      title: 'Total Candidatos',
      value: metrics?.total_candidates ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Vagas Ativas',
      value: metrics?.total_jobs ?? 0,
      icon: Briefcase,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
    },
    {
      title: 'Candidaturas',
      value: metrics?.total_applications ?? 0,
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Média Compatibilidade',
      value: `${metrics?.avg_compatibility ?? 0}%`,
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
    },
  ]

  return (
    <div className="space-y-6 fade-in">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral do desempenho da plataforma de recrutamento.
        </p>
      </div>

      {/* Grid de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm border border-gray-200/80 hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos e resumos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de distribuição */}
        <Card className="shadow-sm border border-gray-200/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Distribuição de Compatibilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metrics?.compatibility_distribution && (
              <CompatibilityChart data={metrics.compatibility_distribution} />
            )}
          </CardContent>
        </Card>

        {/* Resumo de candidaturas */}
        <Card className="shadow-sm border border-gray-200/80">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Resumo de Candidaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <TrendingUp size={18} className="text-emerald-600" />
                  </div>
                  <span className="font-medium text-gray-700">Aprovadas</span>
                </div>
                <span className="text-xl font-bold text-emerald-600">
                  {metrics?.approved_applications ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrendingDown size={18} className="text-red-600" />
                  </div>
                  <span className="font-medium text-gray-700">Rejeitadas</span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {metrics?.rejected_applications ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center">
                    <FileText size={18} className="text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-700">Pendentes</span>
                </div>
                <span className="text-xl font-bold text-gray-600">
                  {(metrics?.total_applications ?? 0) - (metrics?.approved_applications ?? 0) - (metrics?.rejected_applications ?? 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}