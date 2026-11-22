import { useEffect, useState } from 'react'
import { watchActivity } from '../lib/store'
import { cls } from '../lib/utils'
import { PageHeader } from './AdminApp'

const DOT = { added: 'bg-emerald-500', updated: 'bg-blue-500', deleted: 'bg-red-500', restored: 'bg-amber-500' }
const dayKey = (ms) => (ms ? new Date(ms).toDateString() : 'Today')
const dayLabel = (ms) => {
  if (!ms) return 'Today'
  const d = new Date(ms), t = new Date()
  const y = new Date(); y.setDate(t.getDate() - 1)
  if (d.toDateString() === t.toDateString()) return 'Today'
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}
const time = (ms) => (ms ? new Date(ms).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'now')

// Read-only history of every change made in the admin area.
export default function Activity() {
  const [items, setItems] = useState(null)
  useEffect(() => watchActivity(setItems, 200), [])

  const days = []
  for (const a of items || []) {
    const k = dayKey(a.at)
    if (!days.length || days.at(-1).key !== k) days.push({ key: k, label: dayLabel(a.at), list: [] })
    days.at(-1).list.push(a)
  }

  return (
    <div>
      <PageHeader title="Activity log" text="Every change made in the admin area — what changed, who did it and when. Entries cannot be edited or removed." />
      {items === null ? (
        <p className="text-slate-500">Loading…</p>
      ) : items.length === 0 ? (
        <div className="ad-card p-10 text-center text-[13.5px] text-slate-500">No changes yet.</div>
      ) : (
        <div className="grid gap-6">
          {days.map((d) => (
            <section key={d.key}>
              <h2 className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">{d.label}</h2>
              <ol className="ad-card divide-y divide-slate-100">
                {d.list.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-4 py-2.5">
                    <span className={cls('mt-[7px] h-2 w-2 shrink-0 rounded-full', DOT[a.action] || DOT.updated)} />
                    <p className="min-w-0 flex-1 text-[13.5px] text-slate-700">
                      <span className="capitalize">{a.action}</span> <b className="font-medium text-slate-900">{a.what}</b>
                      {a.detail && <span className="text-slate-500"> — {a.detail}</span>}
                      <span className="block text-[12px] text-slate-400">{a.by}</span>
                    </p>
                    <span className="shrink-0 text-[12px] tabular-nums text-slate-400">{time(a.at)}</span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
