import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Briefcase } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success('Login realizado com sucesso!');
      
      // Aguarda um pequeno ciclo e tenta navegação React Router
      setTimeout(() => {
        navigate('/dashboard');
        // Fallback: se após 500ms ainda não redirecionou, força navegação bruta
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            window.location.href = '/dashboard';
          }
        }, 500);
      }, 200);
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Lado esquerdo - Imagem */}
        <div className="hidden lg:block w-1/2 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-12">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
              <Briefcase size={36} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-3">Comece sua jornada profissional</h2>
            <p className="text-white/90 text-lg">Encontre a oportunidade perfeita com matching por IA</p>
            <div className="flex items-center gap-2 mt-8">
              <div className="w-12 h-0.5 bg-white/50 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-12 h-0.5 bg-white/50 rounded-full" />
            </div>
            <p className="text-white/60 text-sm mt-6">RecruitAI</p>
          </div>
        </div>

        {/* Lado direito - Formulário */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3">
                <Briefcase size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">RecruitAI</h1>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo de volta</h1>
                <p className="text-gray-500 mt-2">Entre para continuar a sua jornada</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-10 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Entrar
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  Não tem conta?{' '}
                  <Link to="/register" className="text-blue-600 font-medium hover:text-blue-700">
                    Registre-se
                  </Link>
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-gray-400">RecruitAI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}