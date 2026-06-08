import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useJobStore } from '@/store/jobStore';
import { X, Briefcase, GraduationCap, Clock, Tag } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres'),
  description: z.string().min(20, 'Mínimo 20 caracteres'),
  education_level: z.string().optional(),
  experience_years: z.coerce.number().min(0),
  skills: z.string().optional(),
});

type Form = z.infer<typeof schema>;

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function JobFormModal({ isOpen, onClose, initialData }: JobFormModalProps) {
  const [loading, setLoading] = useState(false);
  const createJob = useJobStore((s) => s.createJob);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: initialData || { experience_years: 0 },
  });

  const descriptionValue = watch('description') || '';

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await createJob({
        title: data.title,
        description: data.description,
        education_level: data.education_level,
        experience_years: data.experience_years,
        required_skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      toast.success('Vaga publicada com sucesso!');
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Erro ao publicar vaga.');
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Criar nova vaga</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <Input label="Título da vaga *" placeholder="Ex: Desenvolvedor Full‑Stack" icon={<Briefcase size={18} />} error={errors.title?.message} {...register('title')} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição *</label>
            <textarea rows={5} className="w-full rounded-xl bg-gray-50 border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500/40" placeholder="Responsabilidades, requisitos..." {...register('description')} />
            <p className={`text-xs mt-1 ${descriptionValue.length < 20 ? 'text-amber-600' : 'text-green-600'}`}>{descriptionValue.length}/20 caracteres mínimos</p>
            {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nível de formação" placeholder="Ensino Superior" icon={<GraduationCap size={18} />} {...register('education_level')} />
            <Input label="Anos de experiência" type="number" min={0} placeholder="3" icon={<Clock size={18} />} error={errors.experience_years?.message} {...register('experience_years')} />
          </div>
          <Input label="Habilidades (separadas por vírgula)" placeholder="Python, React, PostgreSQL" icon={<Tag size={18} />} {...register('skills')} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={loading}>Publicar Vaga</Button>
          </div>
        </form>
      </div>
    </div>
  );
}