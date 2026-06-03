import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useJobStore } from '@/store/jobStore'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { ArrowLeft, Trophy, User, TrendingUp, AlertCircle } from 'lucide-react'

export default function JobCandidatesPage() {
  const { id } = useParams<{ id: string }>()
  const { candidates, isLoading, fetchCandidates } = useJobStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (id) fetchCandidates(id)
  }, [id, fetchCandidates])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">A carregar ranking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Trophy size={24} className="text-amber-500" />
              Candidatos Ranqueados
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Ordenados por compatibilidade com a vaga
            </p>
          </div>
        </div>
        <Badge variant="info">
          {candidates.length} candidato{candidates.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Lista vazia */}
      {candidates.length === 0 ? (
        <Card className="shadow-sm border border-gray-200/80">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Nenhum candidato ainda</h3>
            <p className="text-gray-500 mt-1">
              Os candidatos que se inscreverem aparecerão aqui com as suas pontuações de compatibilidade.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {candidates.map((c, i) => {
            const isTopThree = i < 3
            const scoreColor =
              c.compatibility_score >= 80
                ? 'text-emerald-600'
                : c.compatibility_score >= 60
                  ? 'text-amber-600'
                  : 'text-red-600'

            const scoreBg =
              c.compatibility_score >= 80
                ? 'bg-emerald-50'
                : c.compatibility_score >= 60
                  ? 'bg-amber-50'
                  : 'bg-red-50'

            return (
              <Card
                key={c.application_id}
                className={`shadow-sm border transition-all hover:shadow-md ${
                  isTopThree
                    ? 'border-primary-200/60 bg-gradient-to-r from-white to-primary-50/30'
                    : 'border-gray-200/80'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Posição */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isTopThree
                            ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <User size={14} className="text-gray-500" />
                          </div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {c.candidate_name || `Candidato ${c.candidate_id.slice(0, 8)}`}
                          </h3>
                          {isTopThree && i === 0 && (
                            <span className="text-xs">🥇</span>
                          )}
                          {isTopThree && i === 1 && (
                            <span className="text-xs">🥈</span>
                          )}
                          {isTopThree && i === 2 && (
                            <span className="text-xs">🥉</span>
                          )}
                        </div>

                        {/* Score */}
                        <div className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl ${scoreBg}`}>
                          <TrendingUp size={14} className={scoreColor} />
                          <span className={`text-lg font-bold ${scoreColor}`}>
                            {c.compatibility_score}%
                          </span>
                        </div>
                      </div>

                      {/* Justificação */}
                      {c.justification && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                          {c.justification}
                        </p>
                      )}

                      {/* Skills (se existirem) */}
                      {c.skills && c.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {c.skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {c.skills.length > 5 && (
                            <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 text-xs">
                              +{c.skills.length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
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