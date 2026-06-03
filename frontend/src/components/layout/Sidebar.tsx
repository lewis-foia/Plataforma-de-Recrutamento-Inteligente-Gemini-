import { NavLink, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  LayoutDashboard, Briefcase, FileText, ClipboardList, Upload, Users,
  PlusCircle, BarChart3, User, ChevronRight, LogOut
} from 'lucide-react'

const links = {
  ADMIN: [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/jobs', icon: Briefcase, label: 'Vagas' },
    { to: '/users', icon: Users, label: 'Utilizadores' },
  ],
  RECRUITER: [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/jobs', icon: Briefcase, label: 'Vagas' },
    { to: '/jobs/create', icon: PlusCircle, label: 'Criar Vaga' },
  ],
  CANDIDATE: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/jobs', icon: Briefcase, label: 'Vagas' },
    { to: '/upload-resume', icon: Upload, label: 'Upload Currículo' },
    { to: '/my-applications', icon: ClipboardList, label: 'Candidaturas' },
    { to: '/profile', icon: User, label: 'Meu Perfil' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const items = links[user?.role as keyof typeof links] || links.CANDIDATE

  // Extrair iniciais para avatar
  const initials = user?.email
    ?.split('@')[0]
    ?.split(/[._-]/)
    ?.map(s => s.charAt(0).toUpperCase())
    ?.slice(0, 2)
    ?.join('') || 'U'

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-gray-100 min-h-screen flex flex-col justify-between hidden lg:flex shadow-[inset_-1px_0_0_rgba(0,0,0,0.02)]">
      {/* Navegação principal */}
      <div>
        {/* Cabeçalho do menu */}
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu Principal</h2>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {items.map(link => {
            const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to))
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive: active }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    active
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon
                      size={20}
                      className={`transition-colors ${
                        isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <span className="flex-1">{link.label}</span>
                    {isActive && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-primary-500" />
                    )}
                    {isActive && (
                      <ChevronRight size={14} className="text-primary-400" />
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Rodapé do usuário */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">{user?.email}</p>
            <span className="text-[10px] text-gray-400 capitalize">{user?.role?.toLowerCase()}</span>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/login' }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Terminar sessão"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}