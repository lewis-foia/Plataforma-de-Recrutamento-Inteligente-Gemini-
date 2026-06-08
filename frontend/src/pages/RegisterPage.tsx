import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Briefcase } from 'lucide-react';

const schema = z.object({
  full_name: z.string().min(2, 'Nome completo obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});
type Form = z.infer<typeof schema>;

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    if (!pwd) return { level: 0, color: 'bg-gray-200', text: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { color: 'bg-red-500', text: 'Fraca' },
      { color: 'bg-amber-500', text: 'Média' },
      { color: 'bg-green-500', text: 'Boa' },
      { color: 'bg-green-600', text: 'Forte' },
    ];
    return { level: score, ...levels[Math.min(score, levels.length - 1)] };
  };
  const strength = getStrength(password);
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength.level ? strength.color : 'bg-gray-200'}`} />
        ))}
      </div>
      {password && <p className={`text-xs mt-1 ${strength.level >= 2 ? 'text-green-600' : 'text-amber-600'}`}>Força da senha: {strength.text}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const registerFn = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<Form>({ resolver: zodResolver(schema) });
  const passwordValue = watch('password') || '';

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await registerFn(data.email, data.password, data.full_name);
      toast.success('Conta criada com sucesso! Faça login.');
      navigate('/login');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="flex w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Lado esquerdo - Imagem */}
        <div className="hidden lg:block w-1/2 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)' }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-12">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
              <Briefcase size={36} className="text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-3">Junte-se ao futuro do recrutamento</h2>
            <p className="text-white/90 text-lg">Crie sua conta e comece a encontrar as melhores oportunidades</p>
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
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Criar conta</h1>
                <p className="text-gray-500 mt-2">Comece a sua jornada hoje</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="João Silva" className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40" {...register('full_name')} />
                  </div>
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" placeholder="seu@email.com" className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40" {...register('email')} />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" className="w-full rounded-xl bg-gray-50 border border-gray-200 pl-10 pr-10 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40" {...register('password')} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  <PasswordStrength password={passwordValue} />
                </div>

                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-all disabled:opacity-60">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Criar conta <ArrowRight size={18} /></>}
                </button>
              </form>

              <div className="text-center">
                <p className="text-gray-500 text-sm">Já tem conta? <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">Entrar</Link></p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-gray-400">RecruitAI</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}