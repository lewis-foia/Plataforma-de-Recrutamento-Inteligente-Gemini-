import { useEffect, useState } from 'react'
import { api } from '@/lib/axios'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { ClipboardList, Calendar, Briefcase, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react'

export default function MyApplicationsPage() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/applications/mine')
      .then(r => setApps(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">A carregar candidaturas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList size={24} className="text-primary-600" />
          Minhas Candidaturas
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Acompanhe o status das suas candidaturas às vagas.
        </p>
      </div>

      {/* Estado vazio */}
      {apps.length === 0 ? (
        <Card className="shadow-sm border border-gray-200/80">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Nenhuma candidatura</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              Você ainda não se candidatou a nenhuma vaga. Explore as vagas disponíveis e candidate-se!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map(a => {
            const formattedDate = new Date(a.applied_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })

            const statusConfig = {
              PENDING: {
                icon: Clock,
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                badgeVariant: 'warning' as const,
                label: 'Pendente',
              },
              REVIEWED: {
                icon: Clock,
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                badgeVariant: 'info' as const,
                label: 'Em Análise',
              },
              APPROVED: {
                icon: CheckCircle2,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                badgeVariant: 'success' as const,
                label: 'Aprovada',
              },
              REJECTED: {
                icon: XCircle,
                color: 'text-red-600',
                bg: 'bg-red-50',
                border: 'border-red-200',
                badgeVariant: 'danger' as const,
                label: 'Rejeitada',
              },
            }

            const config = statusConfig[a.status as keyof typeof statusConfig] || statusConfig.PENDING
            const StatusIcon = config.icon

            return (
              <Card
                key={a.id}
                className={`shadow-sm border ${config.border} hover:shadow-md transition-shadow`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    {/* Info da candidatura */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon size={20} className={config.color} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Briefcase size={14} className="text-gray-400 flex-shrink-0" />
                          <p className="font-medium text-gray-900 truncate">
                            Vaga ID: {a.job_id.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-gray-400">
                          <Calendar size={12} />
                          <p className="text-xs">{formattedDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <Badge variant={config.badgeVariant}>
                      {config.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}