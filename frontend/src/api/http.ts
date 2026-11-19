type CsrfToken = {
  token: string
  headerName: string
}

async function csrfToken(): Promise<CsrfToken> {
  const response = await fetch('/api/auth/csrf', {
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error('Не удалось получить CSRF-токен')
  }
  return (await response.json()) as CsrfToken
}

function messageForStatus(status: number): string {
  if (status === 401) return 'Сессия завершилась. Войдите снова.'
  if (status === 403) return 'Недостаточно прав для этой операции.'
  if (status === 404) return 'Запись не найдена.'
  if (status === 409) return 'Операция нарушает ограничения базы данных.'
  if (status >= 500) return 'Ошибка сервера. Проверьте журнал Spring Boot.'
  return `Ошибка HTTP ${status}`
}

async function extractError(response: Response): Promise<Error> {
  let message = messageForStatus(response.status)
  const type = response.headers.get('content-type') ?? ''
  if (type.includes('json')) {
    try {
      const data: unknown = await response.json()
      if (data && typeof data === 'object') {
        const item = data as Record<string, unknown>
        const detail = item.detail ?? item.message
        if (typeof detail === 'string' && detail.trim()) message = detail
        const errors = item.errors
        if (Array.isArray(errors) && errors.length) {
          const first = errors[0]
          if (typeof first === 'string') message = first
          else if (first && typeof first === 'object' && 'message' in first) {
            const errorMessage = (first as { message?: unknown }).message
            if (typeof errorMessage === 'string') message = errorMessage
          }
        }
      }
    } catch {
      // Spring Security может вернуть пустой ответ или HTML.
    }
  }
  return new Error(message)
}

export async function api<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    signal?: AbortSignal
  } = {},
): Promise<T> {
  const method = options.method ?? 'GET'
  const headers: Record<string, string> = { Accept: 'application/json' }

  if (method !== 'GET') {
    const csrf = await csrfToken()
    headers[csrf.headerName] = csrf.token
    if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers,
    signal: options.signal,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) throw await extractError(response)
  if (response.status === 204) return undefined as T
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('json')) {
    throw new Error('Сервер вернул неожиданный формат ответа')
  }
  return (await response.json()) as T
}

// Для скачивания сохраняем браузерную сессию; GET не требует CSRF.
export async function downloadFile(path: string, filename: string): Promise<void> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (!response.ok) throw await extractError(response)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
    URL.revokeObjectURL(url)
  }
}

export function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && String(value).trim()) search.set(key, String(value))
  })
  return search.toString()
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Неизвестная ошибка'
}

export function money(value: number | string | null | undefined): string {
  const num = Number(value ?? 0)
  return Number.isFinite(num)
    ? new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num) + ' ₽'
    : '—'
}

export function dateRu(value: string): string {
  const date = value.split('-')
  return date.length === 3 ? `${date[2]}.${date[1]}.${date[0]}` : value
}
