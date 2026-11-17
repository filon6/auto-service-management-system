import { Link } from 'react-router'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

type Props = {
    title: string
}

export function ModulePage({ title }: Props) {
    return (
        <Card className="bg-white">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm text-slate-500">
                    Интерфейс этого раздела будет добавлен
                    на следующем этапе разработки.
                </p>

                <Link
                    to="/"
                    className="text-sm font-medium text-indigo-600 hover:underline"
                >
                    Вернуться на главную
                </Link>
            </CardContent>
        </Card>
    )
}