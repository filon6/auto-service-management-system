import { useMemo, useState, type FormEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useRole } from '@/auth/RoleContext'
import { api, messageOf, money } from '@/api/http'
import { useList } from '@/api/useList'
import type { AutoService, AutoServiceRequest } from '@/api/types'
import { Alert, ConfirmDelete, DataPanel, fieldClass, FormActions, FormField, Modal, PageHeading, SearchField, TableState, td, th } from '@/components/common/CrudUI'

type ServiceForm = { name: string; costOur: string; costForeign: string }
const empty: ServiceForm = { name: '', costOur: '0.00', costForeign: '0.00' }

export function ServicesPage() {
  const { items, loading, error, reload } = useList<AutoService>('/api/services')
  const { isAdmin } = useRole()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<AutoService | null | undefined>(undefined)
  const [form, setForm] = useState<ServiceForm>(empty)
  const [deleting, setDeleting] = useState<AutoService | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [items, search])

  function openEdit(item?: AutoService) {
    setEditing(item ?? null)
    setForm(item ? { name: item.name, costOur: String(item.costOur), costForeign: String(item.costForeign) } : { ...empty })
    setActionError(''); setNotice('')
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin) return
    setBusy(true); setActionError('')
    try {
      const name = form.name.trim()
      if (!name) throw new Error('Укажи название услуги')
      const costPattern = /^\d{1,8}(?:[.,]\d{1,2})?$/
      if (![form.costOur, form.costForeign].every((cost) => costPattern.test(cost))) {
        throw new Error('Стоимость должна быть неотрицательной, до 8 цифр до запятой и 2 после')
      }
      const body: AutoServiceRequest = {
        name,
        costOur: Number(form.costOur.replace(',', '.')),
        costForeign: Number(form.costForeign.replace(',', '.')),
      }
      if (editing) await api(`/api/services/${editing.id}`, { method: 'PUT', body })
      else await api('/api/services', { method: 'POST', body })
      setEditing(undefined); setNotice(editing ? 'Услуга изменена' : 'Услуга добавлена'); reload()
    } catch (error) { setActionError(messageOf(error)) }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!deleting || !isAdmin) return
    setBusy(true); setActionError('')
    try {
      await api(`/api/services/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null); setNotice('Услуга удалена'); reload()
    } catch (error) { setActionError(messageOf(error)) }
    finally { setBusy(false) }
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <SearchField value={search} onChange={setSearch} placeholder="Поиск по названию услуги" />
        </div>
        <div className="shrink-0">
          <PageHeading onAdd={isAdmin ? () => openEdit() : undefined} addLabel="Добавить услугу" />
        </div>
      </div>
      <Alert text={error} /><Alert text={notice} success />
      <DataPanel><div className="overflow-x-auto"><table className="w-full border-collapse"><thead className="bg-slate-50"><tr>
        <th className={th}>Наименование</th><th className={th}>Отечественные</th><th className={th}>Иностранные</th>{isAdmin && <th className={th}>Действия</th>}
      </tr></thead><tbody className="divide-y divide-slate-100">
        <TableState loading={loading} error={error} empty={filtered.length === 0} colSpan={isAdmin ? 4 : 3} />
        {!loading && !error && filtered.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className={`${td} font-semibold`}>{item.name}</td><td className={td}>{money(item.costOur)}</td><td className={td}>{money(item.costForeign)}</td>
          {isAdmin && <td className={td}><button onClick={() => openEdit(item)} aria-label={`Изменить ${item.name}`} className="mr-3 text-indigo-600"><Pencil className="inline size-4" /></button><button onClick={() => { setDeleting(item); setActionError('') }} aria-label={`Удалить ${item.name}`} className="text-rose-600"><Trash2 className="inline size-4" /></button></td>}
        </tr>)}
      </tbody></table></div></DataPanel>
      {editing !== undefined && isAdmin && <Modal title={editing ? 'Изменить услугу' : 'Новая услуга'} onClose={() => setEditing(undefined)}>
        <form className="space-y-4" onSubmit={(event) => void save(event)}>
          <FormField label="Название" htmlFor="service-name"><input id="service-name" className={fieldClass} maxLength={20} required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></FormField>
          <FormField label="Цена для отечественного автомобиля" htmlFor="service-our"><input id="service-our" className={fieldClass} inputMode="decimal" required value={form.costOur} onChange={(event) => setForm({ ...form, costOur: event.target.value })} /></FormField>
          <FormField label="Цена для иностранного автомобиля" htmlFor="service-foreign"><input id="service-foreign" className={fieldClass} inputMode="decimal" required value={form.costForeign} onChange={(event) => setForm({ ...form, costForeign: event.target.value })} /></FormField>
          <Alert text={actionError} /><FormActions busy={busy} edit={!!editing} onCancel={() => setEditing(undefined)} onDelete={editing ? () => { setDeleting(editing); setEditing(undefined); setActionError('') } : undefined} />
        </form>
      </Modal>}
      {deleting && isAdmin && <ConfirmDelete subject={`услугу «${deleting.name}»`} busy={busy} error={actionError} onClose={() => setDeleting(null)} onConfirm={() => void remove()} />}
    </div>
  )
}
