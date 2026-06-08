import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Spinner from '@/components/ui/Spinner';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <Spinner centered text="A verificar credenciais..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}