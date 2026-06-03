import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useJobStore } from '@/store/jobStore'
import { useAuthStore } from '@/store/authStore'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { api } from '@/lib/axios'
import {
  Plus, Briefcase, GraduationCap, Clock, Calendar, Search, X, Filter, SlidersHorizontal
} from 'lucide-react'

export default function JobsPage() {
  const { jobs, isLoading, fetchJobs } = useJobStore()
  const user = useAuthStore(s => s.user)

  // Estados locais para pesquisa e filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Pesquisa com debounce simples (aciona após parar de digitar por 400ms)
  useEffect(() => {
    if (searchTerm === '' && skillFilter === '') {
      fetchJobs()
      return
    }
    const timer = setTimeout(() => {
      performSearch()
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm, skillFilter])

  const performSearch = useCallback(async () => {
    setIsSearching(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm.trim()) params.append('search', searchTerm.trim())
      if (skillFilter.trim()) params.append('skills', skillFilter.trim())
      const { data } = await api.get(`/jobs?${params.toString()}`)
      useJobStore.setState({ jobs: data })
    } catch {
      // mantém os dados anteriores em caso de erro
    } finally {
      setIsSearching(false)
    }
  }, [searchTerm, skillFilter])

  const clearFilters = () => {
    setSearchTerm('')
    setSkillFilter('')
    fetchJobs()
  }

  const hasActiveFilters = searchTerm.trim() !== '' || skillFilter.trim() !== ''

  // Estado de carregamento inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">A carregar vagas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase size={24} className="text-primary-600" />
            Vagas
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {jobs.length} vaga{jobs.length !== 1 ? 's' : ''} disponível{jobs.length !== 1 ? 'eis' : ''}
            {hasActiveFilters && <span className="text-primary-600"> (filtradas)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && (
            <Link to="/jobs/create">
              <Button className="shadow-md shadow-primary-200">
                <Plus size={18} />
                Nova Vaga
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Barra de pesquisa */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por título ou descrição..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:border-gray-300 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`${showFilters ? 'bg-primary-50 text-primary-600' : ''}`}
          >
            <SlidersHorizontal size={18} />
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <Filter size={16} className="mr-1" /> Limpar
            </Button>
          )}
        </div>

        {/* Filtros expandíveis */}
        {showFilters && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in">
            <div className="relative flex-1">
              <input
                type="text"
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
                placeholder="Filtrar por skills (ex: Python, React)"
                className="w-full pl-4 pr-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
          </div>
        )}

        {isSearching && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-3 h-3 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin" />
            A pesquisar...
          </div>
        )}
      </div>

      {/* Estado vazio */}
      {jobs.length === 0 ? (
        <Card className="shadow-sm border border-gray-200/80">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {hasActiveFilters ? 'Nenhum resultado encontrado' : 'Nenhuma vaga disponível'}
            </h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Tente alterar os termos da pesquisa ou limpar os filtros.'
                : user?.role === 'RECRUITER' || user?.role === 'ADMIN'
                  ? 'Crie uma nova vaga para começar a receber candidatos.'
                  : 'Volte mais tarde para verificar novas oportunidades.'}
            </p>
            {(user?.role === 'RECRUITER' || user?.role === 'ADMIN') && !hasActiveFilters && (
              <Link to="/jobs/create" className="inline-block mt-4">
                <Button variant="outline">
                  <Plus size={16} />
                  Criar Primeira Vaga
                </Button>
              </Link>
            )}
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                <X size={16} className="mr-1" /> Limpar Filtros
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => {
            const formattedDate = new Date(job.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })

            return (
              <Link key={job.id} to={`/jobs/${job.id}`}>
                <Card className="h-full shadow-sm border border-gray-200/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {job.title}
                      </CardTitle>
                      <Badge variant={job.status === 'OPEN' ? 'success' : 'default'}>
                        {job.status === 'OPEN' ? 'Aberta' : 'Fechada'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      {job.education_level && (
                        <span className="inline-flex items-center gap-1">
                          <GraduationCap size={12} />
                          {job.education_level}
                        </span>
                      )}
                      {job.experience_years > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {job.experience_years} {job.experience_years === 1 ? 'ano' : 'anos'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 pt-2 border-t border-gray-50">
                      <Calendar size={11} />
                      <span>{formattedDate}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}