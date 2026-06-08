import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  User,
  LogOut,
  Bell,
  Upload,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const role = user?.role || 'CANDIDATE';
  const initials = user?.email?.charAt(0).toUpperCase() || 'U';

  const baseLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/jobs', icon: Briefcase, label: 'Vagas' },
  ];

  const roleLinks: Record<string, typeof baseLinks> = {
    ADMIN: [...baseLinks, { to: '/users', icon: Users, label: 'Utilizadores' }],
    RECRUITER: [...baseLinks],
    CANDIDATE: [
      ...baseLinks,
      { to: '/upload-resume', icon: Upload, label: 'Submeter CV' }, // novo link
      { to: '/profile', icon: User, label: 'Perfil' },
    ],
  };
  const links = roleLinks[role] || roleLinks.CANDIDATE;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex flex-col bg-gray-50 h-screen sticky top-0 w-64">
      {/* Logo */}
      <div className="flex items-center gap-2 py-6 px-4">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Briefcase size={18} className="text-white" />
        </div>
        <span className="text-xl font-bold text-gray-800">
          Recruit<span className="text-blue-600">AI</span>
        </span>
      </div>

      {/* Navegação principal */}
      <nav className="flex-1 py-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname === link.to || (link.to !== '/dashboard' && location.pathname.startsWith(link.to));
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 mx-2 rounded-lg text-sm font-medium transition-all duration-200 px-3 py-2 ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={24} className="flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Rodapé com notificações e perfil */}
      <div className="pt-4 pb-6">
        {/* Notificações */}
        <div
          className="flex items-center gap-3 mx-2 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 cursor-pointer transition-all"
          onClick={() => alert('Notificações em breve')}
        >
          <Bell size={24} />
          <span className="text-sm">Notificações</span>
          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">3</span>
        </div>

        {/* Perfil + logout */}
        <div
          className="flex items-center gap-3 mx-2 mt-2 rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition-all"
          onClick={() => navigate('/profile')}
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{user?.email}</p>
            <p className="text-xs text-gray-400 capitalize">{role.toLowerCase()}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}