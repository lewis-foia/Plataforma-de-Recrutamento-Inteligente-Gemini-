import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobStore } from '@/store/jobStore'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/axios'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { toast } from 'sonner'
import { Calendar, Briefcase, Users, ArrowLeft, Clock, GraduationCap } from 'lucide-react'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentJob, isLoading, fetchJob, closeJob } = useJobStore()
  const user = useAuthStore(s => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (id) fetchJob(id)
  }, [id, fetchJob])

  const handleApply = async () => {
    try {
      await api.post('/applications', { job_id: id })
      toast.success('Candidatura realizada com sucesso!')
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erro ao candidatar-se')
    }
  }

  const handleClose = async () => {
    if (!id) return
    try {
      await closeJob(id)
      toast.success('Vaga encerrada!')
      fetchJob(id)
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erro ao encerrar vaga')
    }
  }

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">A carregar detalhes da vaga...</p>
        </div>
      </div>
    )
  }

  // Vaga não encontrada
  if (!currentJob) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Vaga não encontrada.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft size={16} /> Voltar
        </Button>
      </div>
    )
  }

  const formattedDate = new Date(currentJob.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Botão voltar */}
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Voltar
      </Button>

      {/* Card principal */}
      <Card className="shadow-sm border border-gray-200/80">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {currentJob.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant={currentJob.status === 'OPEN' ? 'success' : 'default'}>
                  {currentJob.status === 'OPEN' ? 'Aberta' : 'Fechada'}
                </Badge>
                {currentJob.education_level && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                    <GraduationCap size={12} />
                    {currentJob.education_level}
                  </span>
                )}
                {currentJob.experience_years > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                    <Clock size={12} />
                    {currentJob.experience_years} {currentJob.experience_years === 1 ? 'ano' : 'anos'}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Briefcase size={22} className="text-primary-600" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Descrição */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Descrição da Vaga</h4>
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
              {currentJob.description}
            </p>
          </div>

          {/* Data de publicação */}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-50">
            <Calendar size={12} />
            <span>Publicada em {formattedDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-3">
        {user?.role === 'CANDIDATE' && currentJob.status === 'OPEN' && (
          <Button onClick={handleApply} className="shadow-md shadow-primary-200">
            <Briefcase size={18} />
            Candidatar-se
          </Button>
        )}

        {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && (
          <>
            <Button
              variant="secondary"
              onClick={() => navigate(`/jobs/${currentJob.id}/candidates`)}
            >
              <Users size={18} />
              Ver Candidatos
            </Button>

            {currentJob.status === 'OPEN' && (
              <Button variant="danger" onClick={handleClose}>
                Encerrar Vaga
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}