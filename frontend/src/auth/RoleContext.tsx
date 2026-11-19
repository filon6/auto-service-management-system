import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Role = 'ADMIN' | 'USER' | null
const RoleContext = createContext<{ role: Role; loading: boolean }>({ role: null, loading: true })

function roleFromData(data: unknown): Role {
  if (!data || typeof data !== 'object') return null
  const object = data as Record<string, unknown>
  const values: unknown[] = [
    object.role,
    object.roles,
    object.authorities,
    object.authority,
  ]
  if (object.user && typeof object.user === 'object') {
    const user = object.user as Record<string, unknown>
    values.push(user.role, user.roles, user.authorities)
  }
  const names: string[] = []
  function collect(value: unknown): void {
    if (typeof value === 'string') names.push(value.toUpperCase())
    else if (Array.isArray(value)) value.forEach(collect)
    else if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>
      collect(obj.authority ?? obj.role ?? obj.name)
    }
  }
  values.forEach(collect)
  if (names.some((role) => role === 'ADMIN' || role === 'ROLE_ADMIN')) return 'ADMIN'
  if (names.some((role) => role === 'USER' || role === 'ROLE_USER')) return 'USER'
  return null // При неизвестном формате /me запрещаем кнопки изменения.
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/auth/me', {
      credentials: 'same-origin',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Не удалось определить роль')
        return response.json() as Promise<unknown>
      })
      .then((data) => setRole(roleFromData(data)))
      .catch(() => { if (!controller.signal.aborted) setRole(null) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  return <RoleContext.Provider value={{ role, loading }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const { role, loading } = useContext(RoleContext)
  return { role, loading, isAdmin: role === 'ADMIN' }
}
