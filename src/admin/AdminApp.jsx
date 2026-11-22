import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Settings, FerrisWheel, Ticket, BadgePercent, Images, HelpCircle, Inbox, LogOut, Menu, X,
  ExternalLink, History, UserRound, ChevronDown,
} from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { watchAdmin, watchProfile, watchCollection, adminLogout } from '../lib/store'
import { ToastProvider } from './toast'
import Login from './Login'
import { cls } from '../lib/utils'

const AdminContext = createContext({ user: null, profile: {} })
export const useAdmin = () => useContext(AdminContext)

const GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox, badge: 'newEnquiries' },
    ],
  },
  {
    label: 'Website',
    items: [
      { to: '/admin/settings', label: 'Site settings', icon: Settings },
      { to: '/admin/rides', label: 'Rides', icon: FerrisWheel },
      { to: '/admin/tickets', label: 'Tickets', icon: Ticket },
      { to: '/admin/offers', label: 'Offers', icon: BadgePercent },
      { to: '/admin/gallery', label: 'Gallery', icon: Images },
      { to: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/profile', label: 'My profile', icon: UserRound },
      { to: '/admin/activity', label: 'Activity log', icon: History },
    ],
  },
]
const ALL = GROUPS.flatMap((g) => g.items)

export function Avatar({ profile, size = 32 }) {
  const name = profile?.name || profile?.email || '?'
  const initials = name.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return profile?.photo ? (
    <img src={profile.photo} alt="" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
  ) : (
    <span style={{ width: size, height: size, fontSize: size * 0.38 }} className="grid shrink-0 place-items-center rounded-full bg-navy font-semibold text-white">
      {initials}
    </span>
  )
}

function ProfileMenu({ profile }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => !ref.current?.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-slate-100" aria-expanded={open}>
        <Avatar profile={profile} size={30} />
        <span className="hidden text-left leading-tight md:block">
          <span className="block max-w-[160px] truncate text-[13px] font-semibold text-slate-800">{profile.name || 'Admin'}</span>
          <span className="block max-w-[160px] truncate text-[11.5px] text-slate-500">{profile.email}</span>
        </span>
        <ChevronDown size={15} className="text-slate-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <Link to="/admin/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-slate-50"><UserRound size={15} /> My profile</Link>
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-slate-50"><ExternalLink size={15} /> View website</a>
          <div className="my-1 border-t border-slate-100" />
          <button onClick={adminLogout} className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50"><LogOut size={15} /> Sign out</button>
        </div>
      )}
    </div>
  )
}

function Sidebar({ counts, settings, open, onClose }) {
  return (
    <aside className={cls(
      'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0',
      open ? 'translate-x-0 shadow-xl' : '-translate-x-full',
    )}>
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-4">
        <img src={settings.logo} alt="" className="h-8 w-8 object-contain" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13.5px] font-bold text-slate-900">{settings.name}</p>
          <p className="text-[11px] text-slate-500">Admin</p>
        </div>
        <button onClick={onClose} className="ad-icon-btn ml-auto lg:hidden" aria-label="Close menu"><X size={17} /></button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((g) => (
          <div key={g.label} className="mb-5">
            <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{g.label}</p>
            {g.items.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => cls(
                  'relative mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13.5px] font-medium transition',
                  isActive ? 'bg-slate-100 text-slate-900 before:absolute before:-left-3 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r before:bg-gold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}>
                <Icon size={16} strokeWidth={1.9} /> {label}
                {badge && counts[badge] > 0 && (
                  <span className="ml-auto rounded-full bg-navy px-1.5 py-px text-[11px] font-semibold text-white">{counts[badge]}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-3">
        <a href="/" target="_blank" rel="noreferrer" className="ad-btn-ghost w-full justify-start"><ExternalLink size={15} /> View website</a>
      </div>
    </aside>
  )
}

export default function AdminApp() {
  const { settings } = useSite()
  const [user, setUser] = useState(undefined) // undefined = still checking
  const [profile, setProfile] = useState({})
  const [counts, setCounts] = useState({ newEnquiries: 0 })
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => watchAdmin(setUser), [])
  useEffect(() => watchProfile(user?.isAdmin ? user : null, setProfile), [user])
  useEffect(() => {
    if (!user?.isAdmin) return
    return watchCollection('enquiries', (list) => setCounts({ newEnquiries: list.filter((e) => e.status === 'new').length }), { fallback: false })
  }, [user])
  useEffect(() => setOpen(false), [pathname])

  const current = [...ALL].sort((a, b) => b.to.length - a.to.length).find((i) => pathname.startsWith(i.to)) || ALL[0]
  useEffect(() => { document.title = `${current.label} · Admin · ${settings.name}` }, [current.label, settings.name])

  if (user === undefined) {
    return <div className="admin grid min-h-screen place-items-center text-slate-500">Loading…</div>
  }
  if (!user) return <Login />
  if (!user.isAdmin) return <Login notAdmin={user.email} />

  return (
    <AdminContext.Provider value={{ user, profile: { email: user.email, ...profile } }}>
      <ToastProvider>
        <div className="admin min-h-screen">
          <Sidebar counts={counts} settings={settings} open={open} onClose={() => setOpen(false)} />
          {open && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} />}

          <div className="lg:pl-60">
            <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
              <button onClick={() => setOpen(true)} aria-label="Open menu" className="ad-icon-btn lg:hidden"><Menu size={18} /></button>
              <nav className="flex min-w-0 items-center gap-1.5 text-[13px]">
                <Link to="/admin" className="hidden text-slate-500 hover:text-slate-800 sm:inline">Admin</Link>
                <span className="hidden text-slate-300 sm:inline">/</span>
                <span className="truncate font-semibold text-slate-900">{current.label}</span>
              </nav>
              <div className="ml-auto"><ProfileMenu profile={{ email: user.email, ...profile }} /></div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8"><Outlet /></main>
          </div>
        </div>
      </ToastProvider>
    </AdminContext.Provider>
  )
}

// Shared page header used by every admin screen.
export function PageHeader({ title, text, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[22px] font-semibold text-slate-900">{title}</h1>
        {text && <p className="mt-0.5 max-w-2xl text-[13.5px] text-slate-500">{text}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
