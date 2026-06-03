import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ProtectedRoute from './ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import JobsPage from '@/pages/JobsPage'
import JobDetailPage from '@/pages/JobDetailPage'
import CreateJobPage from '@/pages/CreateJobPage'
import UploadResumePage from '@/pages/UploadResumePage'
import MyApplicationsPage from '@/pages/MyApplicationsPage'
import JobCandidatesPage from '@/pages/JobCandidatesPage'
import ProfilePage from '@/pages/ProfilePage'
import UsersPage from '@/pages/UsersPage'

export default function AppRouter() {
  const fetchMe = useAuthStore(s => s.fetchMe)

  useEffect(() => {
    fetchMe()
  }, []) // executa apenas uma vez no mount

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/create" element={<CreateJobPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs/:id/candidates" element={<JobCandidatesPage />} />
          <Route path="/upload-resume" element={<UploadResumePage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}