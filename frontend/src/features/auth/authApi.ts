type CsrfToken = {
    headerName: string
    token: string
}

async function getCsrfToken(): Promise<CsrfToken> {
    const response = await fetch('/api/auth/csrf', {
        credentials: 'same-origin',
        cache: 'no-store',
    })

    if (!response.ok) {
        throw new Error('Не удалось получить CSRF-токен')
    }

    return response.json()
}

export async function isAuthenticated(): Promise<boolean> {
    const response = await fetch('/api/auth/me', {
        credentials: 'same-origin',
        cache: 'no-store',
    })

    if (response.status === 401) {
        return false
    }

    if (!response.ok) {
        throw new Error('Не удалось проверить авторизацию')
    }

    return true
}

export async function login(
    username: string,
    password: string,
): Promise<void> {
    const csrf = await getCsrfToken()

    const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            [csrf.headerName]: csrf.token,
        },
        body: new URLSearchParams({
            username,
            password,
        }),
    })

    if (response.status === 401) {
        throw new Error('Неверный логин или пароль')
    }

    if (response.status !== 204) {
        throw new Error(`Ошибка авторизации: ${response.status}`)
    }
}

export async function logout(): Promise<void> {
    const csrf = await getCsrfToken()

    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            [csrf.headerName]: csrf.token,
        },
    })

    if (response.status !== 204) {
        throw new Error(`Ошибка выхода: ${response.status}`)
    }
}