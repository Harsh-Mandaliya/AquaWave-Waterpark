import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { watchCollection, watchActivity, isContentEmpty, loadStarterContent } from '../lib/store'
import { localDate, addDays } from '../lib/validate'
import { rupee, cls } from '../lib/utils'
import { useToast } from './toast'
import { useAdmin, PageHeader } from './AdminApp'
import { StatusBadge } from './Enquiries'

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
const shortDate = (iso) => new Date(iso + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
const ago = (ms) => {
  if (!ms) return 'just now'
  const m = Math.round((Date.now() - ms) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  if (m < 1440) return `${Math.round(m / 60)} h ago`
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function Stat({ label, value, sub, to }) {
  const body = (
    <>
      <p className="text-[12.5px] font-medium text-slate-500">{label}</p>
      <p className="mt-1.5 text-[26px] font-semibold tabular-nums text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-[12px] text-slate-500">{sub}</p>}
    </>
  )
  return to
    ? <Link to={to} className="ad-card block p-4 transition hover:border-slate-300">{body}</Link>
    : <div className="ad-card p-4">{body}</div>
}

export default function Dashboard() {
  const { settings, rides, offers } = useSite()
  const { profile } = useAdmin()
  const [enquiries, setEnquiries] = useState([])
  const [activity, setActivity] = useState([])
  const [empty, setEmpty] = useState(false)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  useEffect(() => watchCollection('enquiries', setEnquiries, { fallback: false }), [])
  useEffect(() => watchActivity(setActivity, 6), [])
  useEffect(() => { isContentEmpty().then(setEmpty).catch(() => {}) }, [])

  const today = localDate()
  const week = addDays(today, 7)
  const stats = useMemo(() => {
    const bookings = enquiries.filter((e) => e.type === 'booking' && e.status !== 'closed')
    const upcoming = bookings.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
    const thisWeek = upcoming.filter((e) => e.date <= week)
    return {
      fresh: enquiries.filter((e) => e.status === 'new').length,
      upcoming,
      weekGuests: thisWeek.reduce((n, e) => n + (e.adults || 0) + (e.kids || 0), 0),
      weekCount: thisWeek.length,
      weekValue: thisWeek.reduce((n, e) => n + (e.estimate || 0), 0),
    }
  }, [enquiries, today, week])

  async function setup() {
    if (!window.confirm('Fill the website with the default rides, tickets, offers, photos and FAQs?')) return
    setBusy(true)
    try { await loadStarterContent(); setEmpty(false); toast('Default content added.') } catch (err) { toast(err, 'error') } finally { setBusy(false) }
  }

  const firstName = (profile.name || '').split(' ')[0]

  return (
    <div>
      <PageHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ''}`}
        text={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        actions={<Link to="/admin/enquiries" className="ad-btn-primary">Open enquiries</Link>}
      />

      {empty && (
        <div className="ad-card mb-6 flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-[13.5px] text-slate-700">The website has no rides or prices yet. Start with the default content and edit it afterwards.</p>
          <button onClick={setup} disabled={busy} className="ad-btn-outline">{busy ? 'Adding…' : 'Add default content'}</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="New enquiries" value={stats.fresh} sub="waiting for a call back" to="/admin/enquiries" />
        <Stat label="Visits in the next 7 days" value={stats.weekCount} sub={`${stats.weekGuests} guests expected`} />
        <Stat label="Estimated value (7 days)" value={rupee(stats.weekValue)} sub="from booking requests" />
        <Stat label="Live on website" value={`${rides.length} rides`} sub={`${offers.filter((o) => o.active !== false).length} active offers`} to="/admin/rides" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="ad-card">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-[14px] font-semibold text-slate-900">Latest enquiries</h2>
            <Link to="/admin/enquiries" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-slate-500 hover:text-slate-900">View all <ArrowRight size={13} /></Link>
          </div>
          {enquiries.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13.5px] text-slate-500">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {enquiries.slice(0, 6).map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-slate-900">{e.name}</p>
                    <p className="truncate text-[12px] text-slate-500">
                      {e.type === 'booking' ? `${shortDate(e.date)} · ${(e.adults || 0) + (e.kids || 0)} guests · ${e.ticket}` : e.message}
                    </p>
                  </div>
                  <span className="hidden text-[12px] text-slate-400 sm:block">{ago(e.createdAt)}</span>
                  <StatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid content-start gap-6">
          <section className="ad-card">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-[14px] font-semibold text-slate-900">Upcoming visits</h2>
            </div>
            {stats.upcoming.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13.5px] text-slate-500">No upcoming bookings.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.upcoming.slice(0, 5).map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                    <span className={cls('grid h-10 w-10 shrink-0 place-items-center rounded-md border text-center leading-none',
                      e.date === today ? 'border-gold bg-gold-soft text-navy' : 'border-slate-200 text-slate-700')}>
                      <span>
                        <span className="block text-[15px] font-semibold">{Number(e.date.slice(8, 10))}</span>
                        <span className="block text-[9.5px] uppercase text-slate-500">{new Date(e.date + 'T00:00').toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-slate-900">{e.name}</p>
                      <p className="text-[12px] text-slate-500">{e.adults} adults, {e.kids} kids · {e.groupType}</p>
                    </div>
                    <StatusBadge status={e.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="ad-card">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-[14px] font-semibold text-slate-900">Recent changes</h2>
              <Link to="/admin/activity" className="inline-flex items-center gap-1 text-[12.5px] font-medium text-slate-500 hover:text-slate-900">Log <ArrowRight size={13} /></Link>
            </div>
            {activity.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13.5px] text-slate-500">No changes yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {activity.map((a) => (
                  <li key={a.id} className="px-4 py-2.5 text-[13px]">
                    <p className="text-slate-700"><span className="capitalize">{a.action}</span> {a.what}{a.detail && <span className="text-slate-500"> — {a.detail}</span>}</p>
                    <p className="text-[11.5px] text-slate-400">{a.by} · {ago(a.at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-[12px] text-slate-400"><CalendarDays size={13} /> Park hours today: {settings.timings?.weekday}</p>
    </div>
  )
}
