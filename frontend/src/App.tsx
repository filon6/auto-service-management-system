import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { isAuthenticated } from '@/features/auth/authApi'
import { RoleProvider } from '@/auth/RoleContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { CarsPage } from '@/pages/CarsPage'
import { MastersPage } from '@/pages/MastersPage'
import { ServicesPage } from '@/pages/ServicesPage'
import { WorksPage } from '@/pages/WorksPage'
import { ReportsPage } from '@/pages/ReportsPage'

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    isAuthenticated()
      .then((result) => { if (active) setAuthenticated(result) })
      .catch(() => { if (active) setError('Не удалось подключиться к серверу') })
    return () => { active = false }
  }, [])

  if (error) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p role="alert">{error}</p>
      <button className="rounded-lg bg-slate-900 px-4 py-2 text-white" onClick={() => window.location.reload()}>Повторить</button>
    </div>
  )
  if (authenticated === null) return <div className="flex min-h-screen items-center justify-center">Проверка авторизации...</div>

  return (
    <Routes>
      <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={() => setAuthenticated(true)} />} />
      <Route element={authenticated ? (
        <RoleProvider>
          <AppLayout onLogout={() => setAuthenticated(false)} />
        </RoleProvider>
      ) : <Navigate to="/login" replace />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/masters" element={<MastersPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
