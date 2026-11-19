import { useMemo, useState, type FormEvent } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useRole } from '@/auth/RoleContext'
import { api, messageOf } from '@/api/http'
import { useList } from '@/api/useList'
import type { Master } from '@/api/types'
import { Alert, ConfirmDelete, DataPanel, fieldClass, FormActions, FormField, Modal, PageHeading, SearchField, TableState, td, th } from '@/components/common/CrudUI'

export function MastersPage() {
  const { items, loading, error, reload } = useList<Master>('/api/masters')
  const { isAdmin } = useRole()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Master | null | undefined>(undefined)
  const [name, setName] = useState('')
  const [deleting, setDeleting] = useState<Master | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())), [items, search])

  function openEdit(item?: Master) {
    setEditing(item ?? null); setName(item?.name ?? ''); setActionError(''); setNotice('')
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAdmin) return
    setBusy(true); setActionError('')
    try {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Укажи имя мастера')
      if (editing) await api(`/api/masters/${editing.id}`, { method: 'PUT', body: { name: trimmed } })
      else await api('/api/masters', { method: 'POST', body: { name: trimmed } })
      setEditing(undefined); setNotice(editing ? 'Мастер изменён' : 'Мастер добавлен'); reload()
    } catch (error) { setActionError(messageOf(error)) }
    finally { setBusy(false) }
  }
  async function remove() {
    if (!deleting || !isAdmin) return
    setBusy(true); setActionError('')
    try {
      await api(`/api/masters/${deleting.id}`, { method: 'DELETE' })
      setDeleting(null); setNotice('Мастер удалён'); reload()
    } catch (error) { setActionError(messageOf(error)) }
    finally { setBusy(false) }
  }

  return (
    <div className="space-y-6">
      <PageHeading onAdd={isAdmin ? () => openEdit() : undefined} addLabel="Добавить мастера" />
      <Alert text={error} /><Alert text={notice} success />
      <SearchField value={search} onChange={setSearch} placeholder="Поиск по имени мастера" />
      <DataPanel><div className="overflow-x-auto"><table className="w-full border-collapse"><thead className="bg-slate-50"><tr><th className={th}>ID</th><th className={th}>Имя мастера</th>{isAdmin && <th className={th}>Действия</th>}</tr></thead>
        <tbody className="divide-y divide-slate-100">
          <TableState loading={loading} error={error} empty={filtered.length === 0} colSpan={isAdmin ? 3 : 2} />
          {!loading && !error && filtered.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className={td}>{item.id}</td><td className={`${td} font-semibold`}>{item.name}</td>
            {isAdmin && <td className={td}><button onClick={() => openEdit(item)} aria-label={`Изменить ${item.name}`} className="mr-3 text-indigo-600"><Pencil className="inline size-4" /></button><button onClick={() => { setDeleting(item); setActionError('') }} aria-label={`Удалить ${item.name}`} className="text-rose-600"><Trash2 className="inline size-4" /></button></td>}
          </tr>)}
        </tbody>
      </table></div></DataPanel>
      {editing !== undefined && isAdmin && <Modal title={editing ? 'Изменить мастера' : 'Новый мастер'} onClose={() => setEditing(undefined)}>
        <form className="space-y-4" onSubmit={(event) => void save(event)}>
          <FormField label="Имя мастера" htmlFor="master-name"><input id="master-name" className={fieldClass} maxLength={20} required value={name} onChange={(event) => setName(event.target.value)} /></FormField>
          <Alert text={actionError} /><FormActions busy={busy} edit={!!editing} onCancel={() => setEditing(undefined)} onDelete={editing ? () => { setDeleting(editing); setEditing(undefined); setActionError('') } : undefined} />
        </form>
      </Modal>}
      {deleting && isAdmin && <ConfirmDelete subject={`мастера «${deleting.name}»`} busy={busy} error={actionError} onClose={() => setDeleting(null)} onConfirm={() => void remove()} />}
    </div>
  )
}
