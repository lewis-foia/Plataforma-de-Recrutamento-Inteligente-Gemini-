import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { User, Mail, Lock, Briefcase, ArrowRight, Eye, EyeOff, Check } from 'lucide-react'

// Schema original mantido
const schema = z.object({
  full_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

type Form = z.infer<typeof schema>

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { level: 0, color: 'bg-gray-200', text: '' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    const levels = [
      { color: 'bg-red-400', text: 'Fraca' },
      { color: 'bg-amber-400', text: 'Média' },
      { color: 'bg-emerald-400', text: 'Boa' },
      { color: 'bg-emerald-500', text: 'Forte' },
    ]
    return { level: score, ...levels[Math.min(score, levels.length - 1)] }
  }

  const strength = getStrength(password)

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < strength.level ? strength.color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p className={`text-xs ${strength.level >= 2 ? 'text-emerald-600' : 'text-amber-600'}`}>
          Força da senha: {strength.text}
        </p>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const registerFn = useAuthStore(s => s.register)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const passwordValue = watch('password') || ''

  const onSubmit = async (data: Form) => {
    setLoading(true)
    try {
      await registerFn(data.email, data.password, data.full_name)
      toast.success('Registro realizado com sucesso! Faça login para continuar.')
      navigate('/login')
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erro ao registrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado direito - Branding (aparece primeiro em mobile) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-800 via-primary-700 to-primary-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full bg-white/5" />
        <div className="absolute bottom-16 left-16 w-36 h-36 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-white/5" />

        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <Briefcase size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Junte-se a nós</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            Crie sua conta e comece a encontrar as melhores oportunidades com a ajuda da inteligência artificial.
          </p>
          <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
            <div className="flex items-center gap-3 text-white/70">
              <Check size={18} className="text-emerald-300 flex-shrink-0" />
              <span className="text-sm">Análise inteligente de currículos</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <Check size={18} className="text-emerald-300 flex-shrink-0" />
              <span className="text-sm">Matching automático com vagas</span>
            </div>
            <div className="flex items-center gap-3 text-white/70">
              <Check size={18} className="text-emerald-300 flex-shrink-0" />
              <span className="text-sm">Feedback personalizado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado esquerdo - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-white">
        <div className="w-full max-w-md fade-in">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-3">
              <Briefcase size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">RecruitAI</h1>
          </div>

          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
            <p className="text-gray-500 mt-1.5">Comece sua jornada profissional gratuitamente</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              placeholder="Ex: João Silva"
              icon={<User size={18} />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  icon={<Lock size={18} />}
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <PasswordStrength password={passwordValue} />
            </div>

            <Button
              type="submit"
              className="w-full shadow-md shadow-primary-200 mt-2"
              size="lg"
              loading={loading}
            >
              {loading ? 'Registrando...' : 'Criar Conta'}
              {!loading && <ArrowRight size={18} />}
            </Button>
          </form>

          {/* Link de login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link
              to="/login"
              className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors"
            >
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}