import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Mail, Lock, Briefcase, ArrowRight, Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type Form = z.infer<typeof schema>

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const login = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Login realizado com sucesso!')
      navigate('/dashboard')
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Credenciais inválidas. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/5" />
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10 text-white text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
            <Briefcase size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">RecruitAI</h2>
          <p className="text-lg text-white/80 leading-relaxed">
            A plataforma inteligente que utiliza IA para conectar os melhores talentos às oportunidades certas.
          </p>
          <div className="mt-8 flex justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white/60" />
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="w-2 h-2 rounded-full bg-white/60" />
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
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
            <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
            <p className="text-gray-500 mt-1.5">Entre na sua conta para continuar</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={18} />}
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full shadow-md shadow-primary-200"
              size="lg"
              loading={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight size={18} />}
            </Button>
          </form>

          {/* Link de registo */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Não tem conta?{' '}
            <Link
              to="/register"
              className="text-primary-600 font-semibold hover:text-primary-700 hover:underline transition-colors"
            >
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}