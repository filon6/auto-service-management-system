import { useCallback, useEffect, useState } from 'react'
import { api, messageOf } from './http'

export function useList<T>(path: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const reload = useCallback(() => setRevision((value) => value + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')
    api<T[]>(path, { signal: controller.signal })
      .then(setItems)
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setError(messageOf(err))
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [path, revision])

  return { items, loading, error, reload }
}
