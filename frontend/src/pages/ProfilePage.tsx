import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { User, Mail, Phone, MapPin, Linkedin, Save, Award, BarChart3 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const schema = z.object({
  full_name: z.string().min(2, 'Nome obrigatório'),
  phone: z.string().optional(),
  address: z.string().optional(),
  linkedin_url: z.string().optional(),
  summary: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ totalApplications: 0, avgCompatibility: 0, approvalRate: 0 });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile');
        reset({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          linkedin_url: data.linkedin_url || '',
          summary: data.summary || '',
        });
        // Opcional: buscar estatísticas (se existir endpoint)
        try {
          const { data: statsData } = await api.get('/candidates/me/stats');
          setStats(statsData);
        } catch {}
      } catch (err) {
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  const onSubmit = async (data: Form) => {
    setSaving(true);
    try {
      await api.put('/profile', data);
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner centered text="A carregar perfil..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Meu Perfil</h2>
        <p className="text-gray-500 text-sm">Atualize suas informações pessoais</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Nome completo *" error={errors.full_name?.message} {...register('full_name')} />
          <Input label="Telefone" icon={<Phone size={16} />} {...register('phone')} />
          <Input label="Morada" icon={<MapPin size={16} />} {...register('address')} />
          <Input label="LinkedIn" icon={<Linkedin size={16} />} {...register('linkedin_url')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resumo profissional</label>
            <textarea rows={4} className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5" {...register('summary')} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={saving} icon={<Save size={16} />}>Salvar</Button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-2">Estatísticas</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-xs text-gray-500">Candidaturas</p><p className="text-xl font-bold">{stats.totalApplications}</p></div>
          <div><p className="text-xs text-gray-500">Compat. média</p><p className="text-xl font-bold">{stats.avgCompatibility}%</p></div>
          <div><p className="text-xs text-gray-500">Aprovação</p><p className="text-xl font-bold text-green-600">{stats.approvalRate}%</p></div>
        </div>
      </div>
    </div>
  );
}