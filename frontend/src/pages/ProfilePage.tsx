import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { Camera, MapPin, Share2, RefreshCw, UserCheck } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

const schema = z.object({
  full_name: z.string().min(2, 'Nome obrigatório'),
  title: z.string().optional(),
  location: z.string().optional(),
  skills: z.string().optional(),
  bio: z.string().optional(),
});

type Form = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', title: '', location: '', skills: '', bio: '' }
  });

  const formValues = watch();
  const skillsList = formValues.skills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile');
        reset({
          full_name: data.full_name || user?.email?.split('@')[0] || '',
          title: data.title || 'Engenheiro de Software',
          location: data.location || 'Remoto',
          skills: data.skills?.join(', ') || '',
          bio: data.bio || '',
        });
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      } catch (err) {
        toast.error('Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset, user]);

  const onSubmit = async (data: Form) => {
    setSaving(true);
    try {
      await api.put('/profile', {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Máximo 2MB');
      return;
    }
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.post('/profile/avatar', formData);
      setAvatarUrl(data.avatar_url);
      toast.success('Foto atualizada!');
    } catch (err) {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) return <Spinner centered text="A carregar perfil..." />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie suas informações profissionais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA - FOTO + CARDS DE STATUS */}
        <div className="space-y-6">
          {/* Card de perfil com foto */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden mx-auto ring-4 ring-white shadow-md">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-blue-600">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full text-white shadow-sm hover:bg-blue-700 transition"
                disabled={uploadingAvatar}
                title="Alterar foto"
              >
                <Camera size={14} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            {uploadingAvatar && <p className="text-xs text-gray-500 mt-2">Enviando...</p>}
            
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              {formValues.full_name || user?.email?.split('@')[0]}
            </h2>
            <p className="text-gray-500 text-sm">{formValues.title || 'Engenheiro de Software'}</p>
            <p className="text-gray-400 text-xs flex items-center justify-center gap-1 mt-1">
              <MapPin size={12} /> {formValues.location || 'Remoto'}
            </p>
          </div>

          {/* Cards de status (inspirados no Emma Smith) */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <UserCheck size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pronto para trabalhar</h3>
                <p className="text-xs text-gray-500">Mostre aos recrutadores que está disponível</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Share2 size={18} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Compartilhe novidades</h3>
                <p className="text-xs text-gray-500">Conecte-se com outros profissionais</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <RefreshCw size={18} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Mantenha atualizado</h3>
                <p className="text-xs text-gray-500">Recrutadores confiam em perfis completos</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA - FORMULÁRIO E SKILLS */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b border-gray-100">Cargo atual</h3>
            
            <Input label="Nome completo" placeholder="Seu nome" error={errors.full_name?.message} {...register('full_name')} />
            <Input label="Cargo atual" placeholder="Ex: Engenheiro de Software" {...register('title')} />
            <Input label="Localização" placeholder="Ex: São Paulo, Brasil" {...register('location')} />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Habilidades</label>
              <input 
                type="text" 
                placeholder="React, TypeScript, Node.js (separadas por vírgula)" 
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40" 
                {...register('skills')} 
              />
              {skillsList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skillsList.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Biografia</label>
              <textarea 
                rows={3} 
                placeholder="Conte um pouco sobre você e sua carreira..." 
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/40" 
                {...register('bio')} 
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={saving}>Salvar alterações</Button>
            </div>
          </form>

          {/* Lista de habilidades extra (estilo Emma Smith) */}
          {skillsList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Principais habilidades</h3>
              <div className="flex flex-wrap gap-2">
                {skillsList.map((skill, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}