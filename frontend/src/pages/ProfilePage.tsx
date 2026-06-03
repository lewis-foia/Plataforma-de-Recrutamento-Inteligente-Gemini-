import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Spinner from '@/components/ui/Spinner'
import { User, Mail, Phone, MapPin, Linkedin, FileText, Save } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Nome obrigatÃ³rio'),
  phone: z.string().optional(),
  address: z.string().optional(),
  linkedin_url: z.string().optional(),
  summary: z.string().optional(),
})

type Form = z.infer<typeof schema>

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/profile')
        reset({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          linkedin_url: data.linkedin_url || '',
          summary: data.summary || '',
        })
      } catch (err: any) {
        toast.error('Erro ao carregar perfil')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [reset])

  const onSubmit = async (data: Form) => {
    setSaving(true)
    try {
      await api.put('/profile', data)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner className="py-12" />

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User size={24} className="text-primary-600" />
          Meu Perfil
        </h2>
        <p className="text-gray-500 text-sm mt-1">Atualize suas informaÃ§Ãµes pessoais.</p>
      </div>

      <Card className="shadow-sm border border-gray-200/80">
        <CardHeader>
          <CardTitle className="text-base font-semibold">InformaÃ§Ãµes Pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nome completo" icon={<User size={18} />} error={errors.full_name?.message} {...register('full_name')} />
            <Input label="Telefone" icon={<Phone size={18} />} {...register('phone')} placeholder="+244 9XX XXX XXX" />
            <Input label="Morada" icon={<MapPin size={18} />} {...register('address')} placeholder="Cidade, Bairro" />
            <Input label="LinkedIn" icon={<Linkedin size={18} />} {...register('linkedin_url')} placeholder="https://linkedin.com/in/seu-perfil" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumo profissional</label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('summary')}
                placeholder="Breve descriÃ§Ã£o sobre vocÃª..."
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                <Save size={16} /> {saving ? 'Salvando...' : 'Salvar AlteraÃ§Ãµes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}