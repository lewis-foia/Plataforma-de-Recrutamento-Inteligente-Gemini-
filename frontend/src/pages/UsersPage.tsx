import { useEffect, useState } from 'react'
import { api } from '@/lib/axios'
import { User } from '@/types'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import { Users, Shield, UserX, UserCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/users')
      setUsers(data)
    } catch (err: any) {
      toast.error('Erro ao carregar utilizadores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleActive = async (userId: string) => {
    try {
      const { data } = await api.patch(`/users/${userId}/toggle-active`)
      setUsers(prev => prev.map(u => u.id === userId ? data : u))
      toast.success('Estado do utilizador alterado')
    } catch (err: any) {
      toast.error('Erro ao alterar estado')
    }
  }

  if (loading) return <Spinner className="py-12" />

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users size={24} className="text-primary-600" />
          GestÃ£o de Utilizadores
        </h2>
        <p className="text-gray-500 text-sm mt-1">Administre as contas da plataforma.</p>
      </div>

      {users.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-gray-500">Nenhum utilizador encontrado.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-semibold">Email</th>
                  <th className="text-left py-3 font-semibold">Role</th>
                  <th className="text-left py-3 font-semibold">Estado</th>
                  <th className="text-right py-3 font-semibold">AÃ§Ã£o</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-100">
                    <td className="py-3">{u.email}</td>
                    <td className="py-3"><Badge variant={u.role === 'ADMIN' ? 'danger' : u.role === 'RECRUITER' ? 'info' : 'default'}>{u.role}</Badge></td>
                    <td className="py-3">{u.is_active ? <UserCheck size={16} className="text-green-600" /> : <UserX size={16} className="text-red-600" />}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(u.id)}>
                        {u.is_active ? 'Bloquear' : 'Ativar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}