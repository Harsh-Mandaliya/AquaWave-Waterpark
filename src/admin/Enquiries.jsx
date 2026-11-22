import { useEffect, useMemo, useState } from 'react'
import { Phone, MessageCircle, Trash2, Search, Download } from 'lucide-react'
import { watchCollection, updateItem, removeItem } from '../lib/store'
import { telHref, whatsappHref, rupee, cls } from '../lib/utils'
import { useToast } from './toast'
import { PageHeader } from './AdminApp'

export const STATUSES = ['new', 'contacted', 'confirmed', 'closed']
const BADGE = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  contacted: 'bg-amber-50 text-amber-800 ring-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  closed: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function StatusBadge({ status }) {
  return (
    <span className={cls('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-medium capitalize ring-1 ring-inset', BADGE[status] || BADGE.new)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" /> {status}
    </span>
  )
}

const when = (ms) => (ms ? new Date(ms).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '')
const visit = (iso) => (iso ? new Date(iso + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : '—')
const wa = (phone) => (phone?.length === 10 ? `91${phone}` : phone)

function StatusSelect({ e, onChange }) {
  return (
    <select value={e.status} onChange={(ev) => onChange(e, ev.target.value)} aria-label={`Status for ${e.name}`}
      className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[12.5px] capitalize text-slate-700 outline-none focus:border-navy">
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  )
}

function downloadCsv(rows) {
  const cols = ['Received', 'Type', 'Name', 'Mobile', 'Email', 'Visit date', 'Adults', 'Kids', 'Ticket', 'Visit type', 'Estimate', 'Status', 'Message']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map((e) => [
    e.createdAt ? new Date(e.createdAt).toLocaleString('en-IN') : '', e.type, e.name, e.phone, e.email, e.date, e.adults, e.kids,
    e.ticket, e.groupType, e.estimate, e.status, e.message,
  ].map(esc).join(','))
  const blob = new Blob(['﻿' + [cols.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function Enquiries() {
  const [items, setItems] = useState(null)
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const toast = useToast()

  useEffect(() => watchCollection('enquiries', setItems, { fallback: false }), [])

  const list = useMemo(() => {
    const term = q.trim().toLowerCase()
    return (items || [])
      .filter((e) => filter === 'all' || e.status === filter)
      .filter((e) => !term || `${e.name} ${e.phone} ${e.email} ${e.ticket}`.toLowerCase().includes(term))
  }, [items, filter, q])

  async function setStatus(e, status) {
    try { await updateItem('enquiries', e.id, { status }, { label: `${e.name} → ${status}` }); toast(`${e.name} marked as ${status}.`) } catch (err) { toast(err, 'error') }
  }
  async function remove(e) {
    if (!window.confirm(`Delete the enquiry from ${e.name}? This cannot be undone.`)) return
    try { await removeItem('enquiries', e.id, e.name); toast('Enquiry deleted.') } catch (err) { toast(err, 'error') }
  }

  const count = (s) => (items || []).filter((e) => s === 'all' || e.status === s).length

  return (
    <div>
      <PageHeader
        title="Enquiries"
        text="Booking requests and messages from the website. Call or WhatsApp the visitor, then update the status."
        actions={<button onClick={() => downloadCsv(list)} disabled={!list.length} className="ad-btn-outline"><Download size={15} /> Export CSV</button>}
      />

      <div className="ad-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-3 py-2.5">
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {['all', ...STATUSES].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={cls('shrink-0 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium capitalize', filter === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>
                {s} <span className={cls('ml-0.5 tabular-nums', filter === s ? 'text-white/60' : 'text-slate-400')}>{count(s)}</span>
              </button>
            ))}
          </div>
          <label className="relative ml-auto w-full sm:w-64">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or mobile" className="field h-8 py-0 pl-8 text-[13px]" />
          </label>
        </div>

        {items === null ? (
          <p className="p-10 text-center text-slate-500">Loading…</p>
        ) : list.length === 0 ? (
          <p className="p-10 text-center text-[13.5px] text-slate-500">{items.length ? 'No enquiries match.' : 'No enquiries yet. They appear here the moment a visitor sends one.'}</p>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-[13.5px]">
                <thead className="border-b border-slate-200 bg-slate-50/60">
                  <tr>
                    <th className="ad-th">Visitor</th>
                    <th className="ad-th">Visit</th>
                    <th className="ad-th">Guests</th>
                    <th className="ad-th text-right">Estimate</th>
                    <th className="ad-th">Received</th>
                    <th className="ad-th">Status</th>
                    <th className="ad-th"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((e) => (
                    <tr key={e.id} className="align-top hover:bg-slate-50/60">
                      <td className="ad-td">
                        <p className="font-medium text-slate-900">{e.name}</p>
                        <p className="text-[12.5px] tabular-nums text-slate-500">{e.phone}{e.email && ` · ${e.email}`}</p>
                        {e.message && <p className="mt-1 max-w-xs text-[12.5px] text-slate-600">“{e.message}”</p>}
                      </td>
                      <td className="ad-td">
                        {e.type === 'booking'
                          ? <><p className="text-slate-800">{visit(e.date)}</p><p className="text-[12.5px] capitalize text-slate-500">{e.ticket} · {e.groupType}</p></>
                          : <span className="text-[12.5px] text-slate-500">Message</span>}
                      </td>
                      <td className="ad-td tabular-nums text-slate-700">{e.type === 'booking' ? `${e.adults} + ${e.kids}` : '—'}</td>
                      <td className="ad-td text-right tabular-nums text-slate-700">{e.estimate ? rupee(e.estimate) : '—'}</td>
                      <td className="ad-td whitespace-nowrap text-[12.5px] text-slate-500">{when(e.createdAt)}</td>
                      <td className="ad-td"><StatusSelect e={e} onChange={setStatus} /></td>
                      <td className="ad-td">
                        <div className="flex justify-end gap-0.5">
                          <a href={telHref(e.phone)} className="ad-icon-btn" title="Call"><Phone size={15} /></a>
                          <a href={whatsappHref(wa(e.phone), `Hi ${e.name}, regarding your enquiry at our water park.`)} target="_blank" rel="noreferrer" className="ad-icon-btn" title="WhatsApp"><MessageCircle size={15} /></a>
                          <button onClick={() => remove(e)} className="ad-icon-btn hover:text-red-600" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile list */}
            <ul className="divide-y divide-slate-100 md:hidden">
              {list.map((e) => (
                <li key={e.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{e.name}</p>
                      <p className="text-[12.5px] text-slate-500">{e.phone} · {when(e.createdAt)}</p>
                    </div>
                    <StatusSelect e={e} onChange={setStatus} />
                  </div>
                  {e.type === 'booking' && (
                    <p className="mt-2 text-[13px] text-slate-700">{visit(e.date)} · {e.adults} adults, {e.kids} kids · {e.ticket}{e.estimate ? ` · ${rupee(e.estimate)}` : ''}</p>
                  )}
                  {e.message && <p className="mt-1 text-[13px] text-slate-600">“{e.message}”</p>}
                  <div className="mt-3 flex gap-2">
                    <a href={telHref(e.phone)} className="ad-btn-outline h-8"><Phone size={14} /> Call</a>
                    <a href={whatsappHref(wa(e.phone))} target="_blank" rel="noreferrer" className="ad-btn-outline h-8"><MessageCircle size={14} /> WhatsApp</a>
                    <button onClick={() => remove(e)} className="ad-icon-btn ml-auto hover:text-red-600" aria-label="Delete"><Trash2 size={15} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
