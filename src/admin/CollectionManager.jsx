import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, X } from 'lucide-react'
import { watchCollection, addItem, updateItem, removeItem } from '../lib/store'
import { Field, SchemaInput } from './fields'
import { useToast } from './toast'
import { PageHeader } from './AdminApp'

const labelOf = (item) => item.name || item.title || item.q || item.caption || 'this item'

// Generic list editor driven by a schema. Used for rides, tickets, offers, gallery and FAQs.
export default function CollectionManager({ name, title, singular, intro, schema, blank, renderRow }) {
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null) // { id?, ...data }
  const [saving, setSaving] = useState(false)
  const toast = useToast()
  const one = singular || title.replace(/s$/, '').toLowerCase()

  useEffect(() => watchCollection(name, setItems, { fallback: false }), [name])

  // Esc closes the side panel
  useEffect(() => {
    if (!editing) return
    const onKey = (e) => e.key === 'Escape' && setEditing(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [editing])

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { id, createdAt, ...data } = editing
      if (id) await updateItem(name, id, data)
      else await addItem(name, { ...data, order: (items || []).length })
      toast(`${labelOf(data)} saved. The website is updated.`)
      setEditing(null)
    } catch (err) {
      toast(err, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function remove(item) {
    if (!window.confirm(`Delete "${labelOf(item)}"? This cannot be undone.`)) return
    try { await removeItem(name, item.id, labelOf(item)); toast(`${labelOf(item)} deleted.`) } catch (err) { toast(err, 'error') }
  }

  async function move(index, dir) {
    const other = items[index + dir]
    if (!other) return
    try {
      await Promise.all([
        updateItem(name, items[index].id, { order: index + dir }, { log: false }),
        updateItem(name, other.id, { order: index }, { log: false }),
      ])
    } catch (err) { toast(err, 'error') }
  }

  const visible = (f) => !f.show || f.show(editing)

  return (
    <div>
      <PageHeader
        title={title}
        text={intro}
        actions={<button onClick={() => setEditing({ ...blank })} className="ad-btn-primary"><Plus size={15} /> Add {one}</button>}
      />

      <div className="ad-card overflow-hidden">
        {items === null ? (
          <p className="p-10 text-center text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-[13.5px] text-slate-500">No {title.toLowerCase()} yet.</p>
            <button onClick={() => setEditing({ ...blank })} className="ad-btn-outline mt-3"><Plus size={15} /> Add the first {one}</button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item, i) => (
              <li key={item.id} className="group flex items-center gap-2 px-3 py-2.5 hover:bg-slate-50/70">
                <div className="flex flex-col opacity-40 transition group-hover:opacity-100">
                  <button onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded p-0.5 text-slate-500 hover:bg-slate-200 disabled:invisible"><ChevronUp size={14} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="rounded p-0.5 text-slate-500 hover:bg-slate-200 disabled:invisible"><ChevronDown size={14} /></button>
                </div>
                <button onClick={() => setEditing(item)} className="min-w-0 flex-1 text-left">{renderRow(item)}</button>
                <button onClick={() => setEditing(item)} aria-label="Edit" className="ad-icon-btn"><Pencil size={15} /></button>
                <button onClick={() => remove(item)} aria-label="Delete" className="ad-icon-btn hover:text-red-600"><Trash2 size={15} /></button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {items?.length > 0 && <p className="mt-2 text-[12px] text-slate-400">{items.length} {items.length === 1 ? one : title.toLowerCase()} · use the arrows to change the order on the website</p>}

      {/* edit panel slides in from the right */}
      {editing && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/30" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="admin flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-5">
              <h2 className="text-[15px] font-semibold text-slate-900">{editing.id ? `Edit ${one}` : `New ${one}`}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" className="ad-icon-btn"><X size={17} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {schema.filter(visible).map((f) => (
                  <div key={f.id || f.key} className={f.full ? 'sm:col-span-2' : ''}>
                    <Field label={f.label} hint={f.hint}>
                      <SchemaInput f={f} value={editing[f.key]} onChange={(v) => setEditing((d) => ({ ...d, [f.key]: v }))} />
                    </Field>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
              <button type="button" onClick={() => setEditing(null)} className="ad-btn-outline">Cancel</button>
              <button className="ad-btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
