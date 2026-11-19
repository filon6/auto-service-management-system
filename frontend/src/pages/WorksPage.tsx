import { useMemo, useState, type FormEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useRole } from '@/auth/RoleContext'
import { api, dateRu, messageOf } from '@/api/http'
import { useList } from '@/api/useList'
import type { AutoService, Car, Master, Work, WorkRequest } from '@/api/types'
import { Alert, ConfirmDelete, DataPanel, fieldClass, FormActions, FormField, Modal, PageHeading, SearchField, TableState, td, th } from '@/components/common/CrudUI'

const today = () => {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}
const empty = (): WorkRequest => ({ dateWork: today(), masterId: 0, carId: 0, serviceId: 0 })

export function WorksPage() {
  const works = useList<Work>('/api/works')
  const masters = useList<Master>('/api/masters')
  const cars = useList<Car>('/api/cars')
  const services = useList<AutoService>('/api/services')
  const { isAdmin } = useRole()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Work | null | undefined>(undefined)
  const [form, setForm] = useState<WorkRequest>(empty)
  const [deleting, setDeleting] = useState<Work | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')

  const sorted = useMemo(() => [...works.items]
    .sort((a, b) => b.dateWork.localeCompare(a.dateWork) || b.id - a.id)
    .filter((work) => [work.carNum, work.masterName, work.serviceName, work.dateWork]
      .some((value) => value.toLowerCase().includes(search.trim().toLowerCase()))), [works.items, search])

  function openEdit(item?: Work) {
    setEditing(item ?? null)
    setForm(item
      ? { dateWork: item.dateWork, masterId: item.masterId, carId: item.carId, serviceId: item.serviceId }
      : empty())
    setActionError(''); setNotice('')
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin) return
    setBusy(true); setActionError('')
    try {
      if (!form.dateWork || !form.masterId || !form.carId || !form.serviceId) {
        throw new Error('Заполни дату, мастера, автомобиль и услугу')
      }
      if (editing) await api(`/api/works/${editing.id}`, { method: 'PUT', body: form })
      else await api('/api/works', { method: 'POST', body: form })
      setEditing(undefined); setNotice(editing ? 'Работа изменена' : 'Работа назначена')
      works.reload()
    } catch (error) { setActionError(messageOf(error)) }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!deleting || !isAdmin) return
    setBusy(true); setActionError('')
    try {
      await api(`/api/works/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null); setNotice('Работа удалена'); works.reload()
    } catch (error) { setActionError(messageOf(error)) }
    finally { setBusy(false) }
  }
  const referenceError = masters.error || cars.error || services.error
  const lookupsLoading = masters.loading || cars.loading || services.loading

  return (
    <div className="space-y-6">
      <PageHeading onAdd={isAdmin ? () => openEdit() : undefined} addLabel="Назначить работу" />
      <Alert text={works.error} /><Alert text={referenceError} /><Alert text={notice} success />
      <SearchField value={search} onChange={setSearch} placeholder="Поиск по номеру, мастеру, услуге или дате" />
      <DataPanel><div className="overflow-x-auto"><table className="w-full border-collapse"><thead className="bg-slate-50"><tr>
        <th className={th}>Дата</th><th className={th}>Автомобиль</th><th className={th}>Услуга</th><th className={th}>Мастер</th>{isAdmin && <th className={th}>Действия</th>}
      </tr></thead><tbody className="divide-y divide-slate-100">
        <TableState loading={works.loading} error={works.error} empty={sorted.length === 0} colSpan={isAdmin ? 5 : 4} />
        {!works.loading && !works.error && sorted.map((item) => <tr key={item.id} className="hover:bg-slate-50">
          <td className={td}>{dateRu(item.dateWork)}</td><td className={`${td} font-semibold`}>{item.carNum}</td><td className={td}>{item.serviceName}</td><td className={td}>{item.masterName}</td>
          {isAdmin && <td className={td}><button onClick={() => openEdit(item)} aria-label={`Изменить работу ${item.id}`} className="mr-3 text-indigo-600"><Pencil className="inline size-4" /></button><button onClick={() => { setDeleting(item); setActionError('') }} aria-label={`Удалить работу ${item.id}`} className="text-rose-600"><Trash2 className="inline size-4" /></button></td>}
        </tr>)}
      </tbody></table></div></DataPanel>
      {editing !== undefined && isAdmin && <Modal title={editing ? 'Изменить работу' : 'Назначить работу'} onClose={() => setEditing(undefined)}>
        <form className="space-y-4" onSubmit={(event) => void save(event)}>
          <FormField label="Дата выполнения" htmlFor="work-date"><input id="work-date" type="date" className={fieldClass} required value={form.dateWork} onChange={(event) => setForm({ ...form, dateWork: event.target.value })} /></FormField>
          <FormField label="Мастер" htmlFor="work-master"><select id="work-master" className={fieldClass} required disabled={lookupsLoading} value={form.masterId || ''} onChange={(event) => setForm({ ...form, masterId: Number(event.target.value) })}><option value="">Выбери мастера</option>{masters.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
          <FormField label="Автомобиль" htmlFor="work-car"><select id="work-car" className={fieldClass} required disabled={lookupsLoading} value={form.carId || ''} onChange={(event) => setForm({ ...form, carId: Number(event.target.value) })}><option value="">Выбери автомобиль</option>{cars.items.map((item) => <option key={item.id} value={item.id}>{item.num} — {item.mark ?? 'без марки'}</option>)}</select></FormField>
          <FormField label="Услуга" htmlFor="work-service"><select id="work-service" className={fieldClass} required disabled={lookupsLoading} value={form.serviceId || ''} onChange={(event) => setForm({ ...form, serviceId: Number(event.target.value) })}><option value="">Выбери услугу</option>{services.items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
          <p className="text-xs text-slate-500">Ограничение количества работ мастера и изменение даты контролируются PostgreSQL.</p>
          <Alert text={referenceError || actionError} /><FormActions busy={busy || lookupsLoading || !!referenceError} edit={!!editing} onCancel={() => setEditing(undefined)} onDelete={editing ? () => { setDeleting(editing); setEditing(undefined); setActionError('') } : undefined} />
        </form>
      </Modal>}
      {deleting && isAdmin && <ConfirmDelete subject={`работу №${deleting.id} от ${dateRu(deleting.dateWork)}`} busy={busy} error={actionError} onClose={() => setDeleting(null)} onConfirm={() => void remove()} />}
    </div>
  )
}
