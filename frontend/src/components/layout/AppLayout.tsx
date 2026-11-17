import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import { AppSidebar } from './AppSidebar'
import { logout } from '@/features/auth/authApi'

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'

import { Separator } from '@/components/ui/separator'

const titles: Record<string, string> = {
    '/': 'Панель управления',
    '/cars': 'Автомобили',
    '/masters': 'Мастера',
    '/services': 'Услуги',
    '/works': 'Выполненные работы',
    '/reports': 'Отчёты',
}

type Props = {
    onLogout: () => void
}

export function AppLayout({ onLogout }: Props) {
    const { pathname } = useLocation()
    const [error, setError] = useState('')

    async function handleLogout() {
        setError('')

        try {
            await logout()
            onLogout()
        } catch {
            setError('Не удалось завершить сессию')
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar onLogout={() => void handleLogout()} />

            <SidebarInset className="min-w-0 bg-slate-50 text-slate-900">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-white px-6 text-slate-900">
                    <SidebarTrigger />

                    <Separator orientation="vertical" className="h-5" />

                    <h1 className="text-xl font-semibold text-slate-950">
                        {titles[pathname] ?? 'AutoService'}
                    </h1>
                </header>

                {error && (
                    <p
                        className="px-6 pt-4 text-sm text-red-600"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                <main className="min-w-0 flex-1 p-4 md:p-8">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}