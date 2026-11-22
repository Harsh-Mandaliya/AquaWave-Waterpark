import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Phone, MapPin, Clock } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { telHref, cls } from '../lib/utils'

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/rides', label: 'Rides' },
  { to: '/rides?cat=adventure', label: 'Adventure Park' },
  { to: '/tickets', label: 'Tickets' },
  { to: '/offers', label: 'Offers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { settings } = useSite()
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { pathname, search } = useLocation()

  useEffect(() => setOpen(false), [pathname, search])
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (to) => {
    const [path, query] = to.split('?')
    if (query) return pathname === path && search.includes(query)
    if (path === '/rides') return pathname === '/rides' && !search.includes('adventure')
    return pathname === path
  }
  const filled = solid || open

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* slim info bar */}
      <div className={cls('overflow-hidden bg-navy text-[12.5px] text-white/80 transition-all duration-300', solid ? 'max-h-0' : 'max-h-10')}>
        <div className="container-x flex h-9 items-center justify-between gap-4">
          <span className="flex min-w-0 items-center gap-2 truncate"><Clock size={13} className="shrink-0 text-gold" /> {settings.announcement || `Open daily · ${settings.timings?.weekday}`}</span>
          <span className="hidden shrink-0 items-center gap-5 md:flex">
            <a href={settings.mapLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white"><MapPin size={13} className="text-gold" /> Danawada, Gujarat</a>
            {settings.phones?.[0] && <a href={telHref(settings.phones[0])} className="flex items-center gap-1.5 hover:text-white"><Phone size={13} className="text-gold" /> {settings.phones[0]}</a>}
          </span>
        </div>
      </div>

      <nav className={cls('transition-all duration-300', filled ? 'bg-white shadow-[0_8px_30px_-12px_rgba(11,37,69,.25)]' : 'bg-gradient-to-b from-navy/60 to-transparent')}>
        <div className={cls('container-x flex items-center justify-between gap-4 transition-all', solid ? 'h-[68px]' : 'h-[88px]')}>
          <Link to="/" aria-label={`${settings.name} home`} className="flex shrink-0 items-center gap-3">
            <img src={settings.logo} alt={settings.name}
              className={cls('w-auto object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,.25)] transition-all', solid ? 'h-12' : 'h-[72px]')} />
            <span className={cls('hidden leading-tight sm:block', filled ? 'text-navy' : 'text-white')}>
              <span className="block font-display text-xl font-semibold">{settings.name}</span>
              <span className={cls('block text-[11px] font-bold uppercase tracking-[0.2em]', filled ? 'text-gold' : 'text-white/70')}>Danawada · Gujarat</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cls(
                    'relative px-3 py-2 text-[14px] font-bold transition after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:origin-left after:bg-gold after:transition-transform',
                    isActive(item.to) ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
                    filled ? 'text-navy' : 'text-white',
                  )}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link to="/book" className="btn-red hidden px-5 py-2.5 sm:inline-flex">Book a Visit</Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu" aria-expanded={open}
              className={cls('grid h-11 w-11 place-items-center rounded-full lg:hidden', filled ? 'bg-mist text-navy' : 'bg-white/15 text-white')}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {open && (
          <div className="reveal border-t border-line bg-white lg:hidden">
            <ul className="container-x grid py-3">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className={cls('flex items-center justify-between border-b border-line py-3.5 font-display text-lg', isActive(item.to) ? 'text-gold' : 'text-navy')}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4 grid grid-cols-2 gap-2 pb-2">
                <Link to="/book" className="btn-red">Book a Visit</Link>
                {settings.phones?.[0] && <a href={telHref(settings.phones[0])} className="btn-line"><Phone size={15} /> Call</a>}
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
