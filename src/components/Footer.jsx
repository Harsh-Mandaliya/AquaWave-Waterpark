import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock, Mail, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { NAV } from './Navbar'
import { telHref, whatsappHref } from '../lib/utils'

export default function Footer() {
  const { settings } = useSite()
  const social = [
    { href: settings.social?.instagram, icon: Instagram, label: 'Instagram' },
    { href: settings.social?.facebook, icon: Facebook, label: 'Facebook' },
    { href: settings.social?.youtube, icon: Youtube, label: 'YouTube' },
    { href: settings.whatsapp && whatsappHref(settings.whatsapp), icon: MessageCircle, label: 'WhatsApp' },
  ].filter((s) => s.href)

  return (
    <footer className="bg-navy text-white/70">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_.8fr_1fr_1.1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src={settings.logo} alt={settings.name} className="h-20 w-auto" />
            <div>
              <p className="font-display text-2xl text-white">{settings.name}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">Danawada · Gujarat</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed">{settings.about}</p>
          {social.length > 0 && (
            <div className="mt-6 flex gap-2">
              {social.map(({ href, icon: Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:border-gold hover:bg-gold hover:text-navy">
                  <Icon size={17} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg text-white">Explore</h3>
          <ul className="mt-5 grid gap-2.5 text-sm">
            {NAV.map((n) => <li key={n.to}><Link to={n.to} className="transition hover:text-gold">{n.label}</Link></li>)}
            <li><Link to="/book" className="transition hover:text-gold">Book a Visit</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-white">Park hours</h3>
          <ul className="mt-5 grid gap-3 text-sm">
            <li className="flex gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-gold" /><span><span className="block text-white">Monday – Friday</span>{settings.timings?.weekday}</span></li>
            <li className="flex gap-3"><Clock size={16} className="mt-0.5 shrink-0 text-gold" /><span><span className="block text-white">Saturday – Sunday</span>{settings.timings?.weekend}</span></li>
            {settings.timings?.note && <li className="text-white/50">{settings.timings.note}</li>}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg text-white">Contact</h3>
          <ul className="mt-5 grid gap-3 text-sm">
            <li className="flex gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
              <a href={settings.mapLink} target="_blank" rel="noreferrer" className="hover:text-gold">{settings.address}</a>
            </li>
            {settings.phones?.map((p) => (
              <li key={p} className="flex gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-gold" /><a href={telHref(p)} className="hover:text-gold">{p}</a></li>
            ))}
            {settings.email && (
              <li className="flex gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-gold" /><a href={`mailto:${settings.email}`} className="hover:text-gold">{settings.email}</a></li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
          <Link to="/admin" className="hover:text-white">Staff login</Link>
        </div>
      </div>
    </footer>
  )
}
