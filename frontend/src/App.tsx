import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { isAuthenticated } from '@/features/auth/authApi'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ModulePage } from '@/pages/ModulePage'

export default function App() {
    const [authenticated, setAuthenticated] =
        useState<boolean | null>(null)

    const [error, setError] = useState('')

    useEffect(() => {
        let active = true

        isAuthenticated()
            .then((result) => {
                if (active) setAuthenticated(result)
            })
            .catch(() => {
                if (active) {
                    setError('Не удалось подключиться к серверу')
                }
            })

        return () => {
            active = false
        }
    }, [])

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <p role="alert">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-white"
                >
                    Повторить
                </button>
            </div>
        )
    }

    if (authenticated === null) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Проверка авторизации...
            </div>
        )
    }

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    authenticated ? (
                        <Navigate to="/" replace />
                    ) : (
                        <LoginPage
                            onLogin={() => setAuthenticated(true)}
                        />
                    )
                }
            />

            <Route
                element={
                    authenticated ? (
                        <AppLayout
                            onLogout={() => setAuthenticated(false)}
                        />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            >
                <Route path="/" element={<DashboardPage />} />

                <Route
                    path="/cars"
                    element={<ModulePage title="Автомобили" />}
                />

                <Route
                    path="/masters"
                    element={<ModulePage title="Мастера" />}
                />

                <Route
                    path="/services"
                    element={<ModulePage title="Услуги" />}
                />

                <Route
                    path="/works"
                    element={<ModulePage title="Выполненные работы" />}
                />

                <Route
                    path="/reports"
                    element={<ModulePage title="Отчёты" />}
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}