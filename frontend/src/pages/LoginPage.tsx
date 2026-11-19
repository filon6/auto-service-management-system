import { LoginForm } from '@/components/login-form'

type Props = {
    onLogin: () => void
}

export function LoginPage({ onLogin }: Props) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <LoginForm onLogin={onLogin} />
        </main>
    )
}