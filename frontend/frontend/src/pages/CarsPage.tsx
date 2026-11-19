import { useMemo, useState, type FormEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useRole } from '@/auth/RoleContext'
import { api, messageOf } from '@/api/http'
import { useList } from '@/api/useList'
import type { Car, CarRequest } from '@/api/types'
import { Alert, ConfirmDelete, DataPanel, fieldClass, FormActions, FormField, Modal, PageHeading, SearchField, TableState, td, th } from '@/components/common/CrudUI'

const empty: CarRequest = { num: '', mark: '', color: '', isForeign: false }

export function CarsPage() {
  const { items, error, loading, reload } = useList<Car>('/api/cars')
  const { isAdmin } = useRole()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Car | null | undefined>(undefined)
  const [form, setForm] = useState<CarRequest>(empty)
  const [deleting, setDeleting] = useState<Car | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => items.filter((car) =>
    [car.num, car.mark, car.color].some((value) => (value ?? '').toLowerCase().includes(search.trim().toLowerCase())),
  ), [items, search])

  function openCreate() {
    setForm({ ...empty }); setEditing(null); setActionError(''); setNotice('')
  }
  function openEdit(car: Car) {
    setForm({ num: car.num, mark: car.mark ?? '', color: car.color ?? '', isForeign: car.isForeign })
    setEditing(car); setActionError(''); setNotice('')
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin) return
    setBusy(true); setActionError('')
    try {
      const body: CarRequest = {
        num: form.num.trim().toUpperCase(),
        mark: form.mark?.trim() || null,
        color: form.color?.trim() || null,
        isForeign: form.isForeign,
      }
      if (!body.num) throw new Error('Укажи государственный номер')
      if (editing) await api(`/api/cars/${editing.id}`, { method: 'PUT', body })
      else await api('/api/cars', { method: 'POST', body })
      setEditing(undefined)
      setNotice(editing ? 'Автомобиль изменён' : 'Автомобиль добавлен')
      reload()
    } catch (error) { setActionError(messageOf(error)) }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!deleting || !isAdmin) return
    setBusy(true); setActionError('')
    try {
      await api(`/api/cars/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null); setNotice('Автомобиль удалён'); reload()
    } catch (error) { setActionError(messageOf(error)) }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <SearchField value={search} onChange={setSearch} placeholder="Поиск по номеру, марке или цвету" />
        </div>
        <div className="shrink-0">
          <PageHeading onAdd={isAdmin ? openCreate : undefined} addLabel="Добавить автомобиль" />
        </div>
      </div>
      <Alert text={error} /><Alert text={notice} success />
      <DataPanel><div className="overflow-x-auto"><table className="w-full border-collapse">
        <thead className="bg-slate-50"><tr>
          <th className={th}>Госномер</th><th className={th}>Марка</th><th className={th}>Цвет</th><th className={th}>Происхождение</th>
          {isAdmin && <th className={th}>Действия</th>}
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          <TableState loading={loading} error={error} empty={filtered.length === 0} colSpan={isAdmin ? 5 : 4} />
          {!loading && !error && filtered.map((car) => <tr key={car.id} className="hover:bg-slate-50">
            <td className={`${td} font-semibold`}>{car.num}</td><td className={td}>{car.mark || '—'}</td><td className={td}>{car.color || '—'}</td><td className={td}>{car.isForeign ? 'Иностранный' : 'Отечественный'}</td>
            {isAdmin && <td className={`${td} whitespace-nowrap`}>
              <button aria-label={`Изменить ${car.num}`} onClick={() => openEdit(car)} className="mr-3 text-indigo-600 hover:text-indigo-800"><Pencil className="inline size-4" /></button>
              <button aria-label={`Удалить ${car.num}`} onClick={() => { setDeleting(car); setActionError('') }} className="text-rose-600 hover:text-rose-800"><Trash2 className="inline size-4" /></button>
            </td>}
          </tr>)}
        </tbody>
      </table></div></DataPanel>
      {editing !== undefined && isAdmin && <Modal title={editing ? 'Изменить автомобиль' : 'Новый автомобиль'} onClose={() => setEditing(undefined)}>
        <form className="space-y-4" onSubmit={(event) => void save(event)}>
          <FormField label="Государственный номер" htmlFor="car-num"><input id="car-num" className={fieldClass} maxLength={10} required value={form.num} onChange={(event) => setForm({ ...form, num: event.target.value })} /></FormField>
          <FormField label="Марка" htmlFor="car-mark"><input id="car-mark" className={fieldClass} maxLength={20} value={form.mark ?? ''} onChange={(event) => setForm({ ...form, mark: event.target.value })} /></FormField>
          <FormField label="Цвет" htmlFor="car-color"><input id="car-color" className={fieldClass} maxLength={20} value={form.color ?? ''} onChange={(event) => setForm({ ...form, color: event.target.value })} /></FormField>
          <FormField label="Происхождение" htmlFor="car-origin"><select id="car-origin" className={fieldClass} value={String(form.isForeign)} onChange={(event) => setForm({ ...form, isForeign: event.target.value === 'true' })}><option value="false">Отечественный</option><option value="true">Иностранный</option></select></FormField>
          <Alert text={actionError} />
          <FormActions busy={busy} edit={!!editing} onCancel={() => setEditing(undefined)} onDelete={editing ? () => { setDeleting(editing); setEditing(undefined); setActionError('') } : undefined} />
        </form>
      </Modal>}
      {deleting && isAdmin && <ConfirmDelete subject={`автомобиль ${deleting.num}`} busy={busy} error={actionError} onClose={() => setDeleting(null)} onConfirm={() => void remove()} />}
    </div>
  )
}
