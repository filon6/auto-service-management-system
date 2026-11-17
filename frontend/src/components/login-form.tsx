import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  login,
  isAuthenticated,
} from '@/features/auth/authApi'

type LoginFormProps = {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(
      event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(username, password)

      const authenticated = await isAuthenticated()

      if (!authenticated) {
        throw new Error('Не удалось подтвердить сессию')
      }

      onLogin()
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : 'Ошибка авторизации',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="pb-6 text-center">
          <CardTitle className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Система управления автосервисом
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="username">Логин</Label>
              <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white text-black placeholder:text-gray-500 focus-visible:bg-white"
                  required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white text-black placeholder:text-gray-500 focus-visible:bg-white"
                  required
              />
            </div>

            {error && (
                <p
                    role="alert"
                    className="text-sm text-destructive"
                >
                  {error}
                </p>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={loading}
            >
              {loading ? 'Выполняется вход...' : 'Войти'}
            </Button>
          </form>

          <div className="overflow-hidden rounded-lg border bg-muted">
            <img
                src="/login-image.png"
                alt="Автосервис"
                className="h-48 w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
  )
}