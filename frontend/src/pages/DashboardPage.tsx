import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
    CarFront,
    ClipboardList,
    Users,
    Wrench,
} from 'lucide-react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import {
    getDashboardData,
    type DashboardData,
} from '@/api/dashboardApi'

function formatDate(date: string): string {
    const parts = date.split('-')
    return parts.length === 3
        ? parts.reverse().join('.')
        : date
}

export function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [error, setError] = useState('')

    useEffect(() => {
        const controller = new AbortController()

        getDashboardData(controller.signal)
            .then(setData)
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : 'Не удалось загрузить данные',
                    )
                }
            })

        return () => controller.abort()
    }, [])

    const stats = [
        {
            title: 'Автомобили',
            value: data?.cars ?? '—',
            icon: CarFront,
        },
        {
            title: 'Мастера',
            value: data?.masters ?? '—',
            icon: Users,
        },
        {
            title: 'Услуги',
            value: data?.services ?? '—',
            icon: Wrench,
        },
        {
            title: 'Выполненные работы',
            value: data?.works ?? '—',
            icon: ClipboardList,
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Обзор автосервиса
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Текущие данные системы управления автосервисом
                </p>
            </div>

            {error && (
                <div
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    role="alert"
                >
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon

                    return (
                        <Card key={stat.title} className="bg-white">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500">
                                    {stat.title}
                                </CardTitle>

                                <Icon className="size-5 text-indigo-500" />
                            </CardHeader>

                            <CardContent>
                                <div className="text-3xl font-bold text-slate-900">
                                    {stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg">
                            Последние выполненные работы
                        </CardTitle>
                        <p className="mt-1 text-sm text-slate-500">
                            Последние записи журнала обслуживания
                        </p>
                    </div>

                    <Link
                        to="/works"
                        className="shrink-0 text-sm font-medium text-indigo-600 hover:underline"
                    >
                        Все работы
                    </Link>
                </CardHeader>

                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Дата</TableHead>
                                    <TableHead>Автомобиль</TableHead>
                                    <TableHead>Услуга</TableHead>
                                    <TableHead>Мастер</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {!data ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            {error ? 'Данные недоступны' : 'Загрузка...'}
                                        </TableCell>
                                    </TableRow>
                                ) : data.recentWorks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">
                                            Работы пока отсутствуют
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.recentWorks.map((work) => (
                                        <TableRow key={work.id}>
                                            <TableCell>
                                                {formatDate(work.dateWork)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {work.carNum}
                                            </TableCell>
                                            <TableCell>{work.serviceName}</TableCell>
                                            <TableCell>{work.masterName}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}