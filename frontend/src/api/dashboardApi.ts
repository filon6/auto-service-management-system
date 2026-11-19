export type Work = {
    id: number
    dateWork: string
    masterName: string
    carNum: string
    serviceName: string
}

export type DashboardData = {
    cars: number
    masters: number
    services: number
    works: number
    recentWorks: Work[]
}

async function getList<T>(
    endpoint: string,
    signal: AbortSignal,
): Promise<T[]> {
    const response = await fetch(endpoint, {
        credentials: 'same-origin',
        signal,
    })

    if (response.status === 401) {
        throw new Error('Сессия истекла. Войдите в систему заново.')
    }

    if (!response.ok) {
        throw new Error(`Ошибка запроса ${endpoint}: ${response.status}`)
    }

    return response.json() as Promise<T[]>
}

export async function getDashboardData(
    signal: AbortSignal,
): Promise<DashboardData> {
    const [cars, masters, services, works] = await Promise.all([
        getList<{ id: number }>('/api/cars', signal),
        getList<{ id: number }>('/api/masters', signal),
        getList<{ id: number }>('/api/services', signal),
        getList<Work>('/api/works', signal),
    ])

    const recentWorks = [...works]
        .sort(
            (a, b) =>
                b.dateWork.localeCompare(a.dateWork) || b.id - a.id,
        )
        .slice(0, 8)

    return {
        cars: cars.length,
        masters: masters.length,
        services: services.length,
        works: works.length,
        recentWorks,
    }
}