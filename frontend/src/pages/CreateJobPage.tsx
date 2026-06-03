import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useJobStore } from '@/store/jobStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Briefcase, ChevronRight, GraduationCap, Clock, Tag } from 'lucide-react'

// Schema original mantido
const schema = z.object({
  title: z.string().min(5, 'Mínimo de 5 caracteres'),
  description: z.string().min(20, 'Mínimo de 20 caracteres'),
  education_level: z.string().optional(),
  experience_years: z.coerce.number().min(0, 'Deve ser um número positivo'),
  skills: z.string().optional(),
})

type Form = z.infer<typeof schema>

export default function CreateJobPage() {
  const [loading, setLoading] = useState(false)
  const createJob = useJobStore(s => s.createJob)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      experience_years: 0,
    },
  })

  const descriptionLength = watch('description')?.length || 0

  const onSubmit = async (data: Form) => {
    setLoading(true)
    try {
      await createJob({
        title: data.title,
        description: data.description,
        education_level: data.education_level || undefined,
        experience_years: data.experience_years,
        required_skills: data.skills
          ? data.skills.split(',').map(s => s.trim()).filter(Boolean)
          : [],
      })
      toast.success('Vaga publicada com sucesso!')
      navigate('/jobs')
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erro ao publicar vaga.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto fade-in space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <Briefcase size={20} className="text-primary-600" />
          </span>
          Criar nova vaga
        </h1>
        <p className="text-gray-500 mt-1 ml-12">
          Preencha os detalhes abaixo para encontrar o talento certo.
        </p>
      </div>

      {/* Formulário */}
      <Card className="shadow-sm border border-gray-200/80">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Detalhes da Vaga
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Título */}
            <Input
              label="Título da vaga"
              placeholder="Ex: Desenvolvedor Full‑Stack Sênior"
              icon={<Briefcase size={18} />}
              error={errors.title?.message}
              {...register('title')}
            />

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Descrição da vaga
              </label>
              <textarea
                rows={5}
                placeholder="Descreva as responsabilidades, requisitos, diferenciais..."
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all resize-none
                  hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                  ${errors.description ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' : 'border-gray-300'}`}
                {...register('description')}
              />
              <div className="flex justify-between items-center mt-1.5">
                {errors.description?.message ? (
                  <p className="text-red-500 text-xs">{errors.description.message}</p>
                ) : (
                  <span />
                )}
                <p className={`text-xs font-medium ml-auto transition-colors ${
                  descriptionLength < 20 ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {descriptionLength}/20 caracteres mínimos
                </p>
              </div>
            </div>

            {/* Grid 2 colunas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nível de formação"
                placeholder="Ex: Ensino Superior Completo"
                icon={<GraduationCap size={18} />}
                {...register('education_level')}
              />
              <Input
                label="Anos de experiência"
                type="number"
                min={0}
                placeholder="Ex: 3"
                icon={<Clock size={18} />}
                error={errors.experience_years?.message}
                {...register('experience_years')}
              />
            </div>

            {/* Habilidades */}
            <Input
              label="Habilidades necessárias"
              placeholder="Ex: Python, React, PostgreSQL (separadas por vírgula)"
              icon={<Tag size={18} />}
              {...register('skills')}
            />

            {/* Botões */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/jobs')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="shadow-md shadow-primary-200"
              >
                {loading ? 'Publicando...' : 'Publicar Vaga'}
                <ChevronRight size={16} />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}