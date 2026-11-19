import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PageHeading({ onAdd, addLabel = 'Добавить' }: {
  onAdd?: () => void
  addLabel?: string
}) {
  if (!onAdd) return null

  return (
    <div className="flex justify-end">
      <Button
        type="button"
        onClick={onAdd}
        className="bg-indigo-600 text-white hover:bg-indigo-700"
      >
        <Plus className="size-4" />
        {addLabel}
      </Button>
    </div>
  )
}

export function SearchField({ value, onChange, placeholder = 'Поиск...' }: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="relative block w-full max-w-md">
      <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <span className="sr-only">Поиск</span>
      <input value={value} onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </label>
  )
}

export function Alert({ text, success = false }: { text: string; success?: boolean }) {
  return text ? (
    <div role={success ? 'status' : 'alert'} className={`rounded-lg border px-4 py-3 text-sm ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
      {text}
    </div>
  ) : null
}

export function DataPanel({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{children}</div>
}

export const th = 'whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600'
export const td = 'px-4 py-3 text-sm text-slate-900'

export function TableState({ loading, error, empty, colSpan }: {
  loading: boolean
  error: string
  empty: boolean
  colSpan: number
}) {
  if (!loading && !error && !empty) return null
  return (
    <tr><td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500">
      {loading ? 'Загрузка...' : error ? 'Не удалось загрузить данные. Попробуйте открыть страницу повторно.' : 'Записей не найдено'}
    </td></tr>
  )
}

export function FormField({ label, children, htmlFor }: { label: string; children: ReactNode; htmlFor?: string }) {
  return <div className="space-y-1.5"><label htmlFor={htmlFor} className="block text-sm font-medium text-slate-800">{label}</label>{children}</div>
}
export const fieldClass = 'h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100'

export function Modal({ title, onClose, children }: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const labelId = useId()

  // Render the modal in document.body so it cannot be clipped or hidden
  // by the sidebar layout or a parent with overflow/transform styles.
  useEffect(() => {
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const firstField = contentRef.current?.querySelector<HTMLElement>(
      'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])',
    )
    firstField?.focus()

    return () => {
      document.body.style.overflow = oldOverflow
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      // Keep keyboard focus inside the open modal.
      if (event.key !== 'Tab') return
      const focusable = Array.from(
        contentRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!contentRef.current?.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h3 id={labelId} className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function FormActions({ busy, onCancel, edit, onDelete }: {
  busy: boolean
  onCancel: () => void
  edit: boolean
  onDelete?: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-3">
      {onDelete ? <Button type="button" onClick={onDelete} disabled={busy} className="bg-rose-600 text-white hover:bg-rose-700">Удалить</Button> : <span />}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="bg-white text-slate-900" onClick={onCancel} disabled={busy}>Закрыть</Button>
        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700" disabled={busy}>{busy ? 'Сохранение...' : edit ? 'Изменить' : 'Добавить'}</Button>
      </div>
    </div>
  )
}

export function ConfirmDelete({ subject, onConfirm, onClose, busy, error }: {
  subject: string
  onConfirm: () => void
  onClose: () => void
  busy: boolean
  error: string
}) {
  return (
    <Modal title="Подтверждение удаления" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-700">Удалить <strong>{subject}</strong>? Действие нельзя отменить.</p>
        <Alert text={error} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" className="bg-white text-slate-900" onClick={onClose} disabled={busy}>Отмена</Button>
          <Button type="button" onClick={onConfirm} disabled={busy} className="bg-rose-600 text-white hover:bg-rose-700">{busy ? 'Удаление...' : 'Удалить'}</Button>
        </div>
      </div>
    </Modal>
  )
}
