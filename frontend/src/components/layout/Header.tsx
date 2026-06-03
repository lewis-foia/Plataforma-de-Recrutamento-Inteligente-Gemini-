import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Briefcase } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  // Extrai a primeira letra do email para o avatar
  const avatarLetter = user?.email?.charAt(0).toUpperCase() || 'U'

  // Configuração visual por role
  const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
    ADMIN: { bg: 'bg-red-50', text: 'text-red-700', label: 'Admin' },
    RECRUITER: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Recrutador' },
    CANDIDATE: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Candidato' },
  }
  const roleStyle = roleConfig[user?.role || ''] || roleConfig.CANDIDATE

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm shadow-primary-200">
            <Briefcase size={18} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-gray-900 leading-tight">
              Recruit<span className="text-primary-600">AI</span>
            </h1>
            <p className="text-[10px] text-gray-400 -mt-0.5">Recrutamento Inteligente</p>
          </div>
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-gray-50/80 rounded-xl px-3 py-2 border border-gray-100">
            {/* Avatar com iniciais */}
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
              {avatarLetter}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate max-w-[140px]">
                {user?.email}
              </p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleStyle.bg} ${roleStyle.text}`}>
                {roleStyle.label}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline ml-1">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}