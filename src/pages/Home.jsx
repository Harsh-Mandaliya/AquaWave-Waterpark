import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin, Clock, Phone, ArrowRight, ArrowUpRight, Check, Plus, Minus, ShieldCheck, Utensils, Lock, Car, Star,
} from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { SectionHead, YouTubeCard } from '../components/ui'
import RideCard from '../components/RideCard'
import RideModal from '../components/RideModal'
import { HERO_PHOTOS } from '../data/defaults'
import { youtubeId, telHref, rupee, cls } from '../lib/utils'

function Hero() {
  const { settings } = useSite()
  const vid = youtubeId(settings.heroVideo)
  const photos = settings.heroPhotos?.length ? settings.heroPhotos : HERO_PHOTOS
  const [a, b, c, d] = photos
  // fade the video in only once it is playing, so YouTube's loading/pause icons never show
  const [videoReady, setVideoReady] = useState(false)

  return (
    <section className="relative overflow-hidden bg-navy text-white">
      {/* background: park video if set, otherwise the main photo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <img src={a} alt="" className="absolute inset-0 h-full w-full object-cover" />
        {vid && (
          <iframe
            title="background video"
            src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&modestbranding=1&playsinline=1&rel=0`}
            allow="autoplay; encrypted-media"
            onLoad={() => setTimeout(() => setVideoReady(true), 2500)}
            className={cls(
              'absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 scale-125 transition-opacity duration-1000',
              videoReady ? 'opacity-100' : 'opacity-0',
            )}
          />
        )}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(11,37,69,.94)_0%,rgba(11,37,69,.78)_45%,rgba(11,37,69,.45)_100%)]" />

      <div className="container-x relative grid min-h-[100svh] items-center gap-12 pb-16 pt-40 lg:grid-cols-[1.05fr_.95fr] lg:pt-36">
        <div className="reveal">
          <span className="eyebrow"><span className="h-px w-10 bg-gold" /> {settings.tagline}</span>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.02] sm:text-6xl xl:text-7xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{settings.heroSubtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/book" className="btn-red px-8 py-3.5 text-[15px]">Book a Visit</Link>
            <Link to="/rides" className="btn-ghost px-8 py-3.5 text-[15px]">Explore Rides <ArrowRight size={17} /></Link>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-6">
            {(settings.stats || []).slice(0, 3).map((s) => (
              <div key={s.label} className="px-4 first:pl-0">
                <dt className="font-display text-3xl text-gold">{s.value}</dt>
                <dd className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* side photo collage */}
        <div className="reveal relative hidden h-[560px] lg:block" style={{ animationDelay: '.15s' }}>
          <div className="grid h-full grid-cols-2 grid-rows-6 gap-4">
            <img src={b} alt="Family enjoying the water park" className="row-span-4 h-full w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/20" />
            <img src={c} alt="Colourful water slides" className="row-span-3 h-full w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/20" />
            <img src={d} alt="Kids play area" className="row-span-3 h-full w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/20" />
            <img src={a} alt="Pool with slides" className="row-span-2 h-full w-full rounded-2xl object-cover shadow-2xl ring-1 ring-white/20" />
          </div>
          <div className="absolute -left-8 bottom-16 flex items-center gap-3 rounded-xl bg-white p-4 pr-6 text-navy shadow-2xl">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold"><Star size={20} fill="currentColor" /></span>
            <span>
              <span className="block font-display text-lg leading-none">Family favourite</span>
              <span className="text-xs text-slate-500">near Surendranagar</span>
            </span>
          </div>
        </div>

        {/* mobile photo strip */}
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 lg:hidden">
          {[b, c, d].map((src) => (
            <img key={src} src={src} alt="" className="h-40 w-56 shrink-0 rounded-xl object-cover ring-1 ring-white/20" />
          ))}
        </div>
      </div>
    </section>
  )
}

function InfoStrip() {
  const { settings } = useSite()
  const items = [
    { icon: Clock, title: 'Opening hours', text: settings.timings?.weekday },
    { icon: MapPin, title: 'Location', text: settings.address, href: settings.mapLink },
    { icon: Phone, title: 'Bookings', text: settings.phones?.join('  ·  '), href: telHref(settings.phones?.[0] || '') },
  ]
  return (
    <section className="border-b border-line bg-white">
      <div className="container-x grid divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
        {items.map(({ icon: Icon, title, text, href }) => {
          const Tag = href ? 'a' : 'div'
          return (
            <Tag key={title} href={href} target={href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
              className="group flex items-center gap-4 py-6 md:px-8 md:first:pl-0">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/40 text-gold transition group-hover:bg-gold group-hover:text-white"><Icon size={20} /></span>
              <span>
                <span className="block text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{title}</span>
                <span className="text-[15px] font-semibold text-navy">{text}</span>
              </span>
            </Tag>
          )
        })}
      </div>
    </section>
  )
}

function About() {
  const { settings } = useSite()
  return (
    <section className="container-x grid items-center gap-14 py-24 lg:grid-cols-2">
      <div className="relative">
        <img src="/images/banner-resort.webp" alt="Water park overview" loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        <img src="/images/ride-lazy-river.webp" alt="" loading="lazy" className="absolute -bottom-10 -right-4 hidden w-56 rounded-2xl border-8 border-white object-cover shadow-xl sm:block" />
      </div>
      <div>
        <SectionHead center={false} eyebrow="Welcome" title={`A full day of fun at ${settings.name}`} />
        <p className="-mt-6 text-[17px] leading-relaxed text-slate-600">{settings.about}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {['Wave pool & lazy river', 'Thrill slides for teens', 'Dedicated kids zone', 'Adventure park on dry land'].map((t) => (
            <li key={t} className="flex items-center gap-2 font-semibold text-navy"><Check size={18} className="text-gold" /> {t}</li>
          ))}
        </ul>
        <Link to="/rides" className="btn-navy mt-8">Discover the park <ArrowRight size={16} /></Link>
      </div>
    </section>
  )
}

function Zones({ rides }) {
  const count = (c) => rides.filter((r) => r.category === c).length
  const zones = [
    { cat: 'water', title: 'Water Rides', text: 'Wave pool, lazy river and family slides', img: '/images/ride-wave-pool.webp' },
    { cat: 'thrill', title: 'Thrill Slides', text: 'Funnels, free falls and racers', img: '/images/ride-tornado.webp' },
    { cat: 'kids', title: 'Kids Zone', text: 'Shallow pools and gentle slides', img: '/images/ride-pirate-ship.webp' },
    { cat: 'adventure', title: 'Adventure Park', text: 'Zipline, ropes and climbing', img: '/images/ride-zipline.webp' },
  ]
  return (
    <section className="bg-mist py-24">
      <div className="container-x">
        <SectionHead eyebrow="Our zones" title="Something for every kind of fun" text="From slow floats to steep drops, explore four zones spread across the park." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {zones.map(({ cat, title, text, img }) => (
            <Link key={cat} to={`/rides?cat=${cat}`} className="group relative aspect-[3/4] overflow-hidden rounded-2xl">
              <img src={img} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/30 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold">{count(cat)} attractions</span>
                <span className="mt-1 block font-display text-3xl">{title}</span>
                <span className="mt-1 block text-sm text-white/75">{text}</span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold">Explore <ArrowUpRight size={16} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeaturedRides({ rides }) {
  const [active, setActive] = useState(null)
  const featured = rides.filter((r) => r.featured).slice(0, 6)
  if (!featured.length) return null
  return (
    <section className="container-x py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHead center={false} eyebrow="Popular rides" title="Rides our guests love" />
        <Link to="/rides" className="btn-line mb-12">View all rides <ArrowRight size={16} /></Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((r) => <RideCard key={r.id} ride={r} onOpen={setActive} />)}
      </div>
      <RideModal ride={active} onClose={() => setActive(null)} />
    </section>
  )
}

function TicketsPreview({ tickets }) {
  if (!tickets.length) return null
  return (
    <section className="relative overflow-hidden bg-navy py-24 text-white">
      <img src="/images/banner-aerial.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="container-x relative">
        <SectionHead light eyebrow="Tickets" title="Simple pricing, all-day access" text="Ticket type is decided by height at the gate. Children under 3 ft enter free." />
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {tickets.map((t) => (
            <div key={t.id} className={cls('relative flex flex-col rounded-2xl p-8', t.highlight ? 'bg-white text-navy shadow-2xl md:-translate-y-3' : 'border border-white/15 bg-white/5 backdrop-blur')}>
              {t.highlight && <span className="absolute right-6 top-6 rounded-full bg-gold px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-navy">Popular</span>}
              <h3 className="font-display text-2xl">{t.title}</h3>
              <p className={cls('text-sm', t.highlight ? 'text-slate-500' : 'text-white/60')}>{t.subtitle}</p>
              <p className="mt-6 font-display text-5xl">{rupee(t.priceWeekday)}</p>
              <p className={cls('mt-1 text-sm', t.highlight ? 'text-slate-500' : 'text-white/60')}>weekdays · <b className="text-gold">{rupee(t.priceWeekend)}</b> weekends</p>
              <ul className={cls('mt-6 grid gap-2.5 border-t pt-6 text-[15px]', t.highlight ? 'border-line' : 'border-white/15')}>
                {(t.includes || []).map((inc) => <li key={inc} className="flex gap-2"><Check size={17} className="mt-0.5 shrink-0 text-gold" /> {inc}</li>)}
              </ul>
              <Link to={`/book?ticket=${t.id}`} className={cls('mt-auto w-full pt-8')}>
                <span className={cls('w-full', t.highlight ? 'btn-red' : 'btn-ghost')}>Book {t.title}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Videos({ gallery }) {
  const videos = gallery.filter((g) => g.type === 'video').slice(0, 3)
  if (!videos.length) return null
  const [first, ...rest] = videos
  return (
    <section className="container-x py-24">
      <SectionHead eyebrow="Watch" title="See the park in action" />
      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <YouTubeCard url={first.src} caption={first.caption} />
        <div className="grid gap-6">
          {rest.map((v) => <YouTubeCard key={v.id} url={v.src} caption={v.caption} />)}
        </div>
      </div>
    </section>
  )
}

function Offers({ offers }) {
  const live = offers.filter((o) => o.active !== false).slice(0, 3)
  if (!live.length) return null
  return (
    <section className="bg-cream py-24">
      <div className="container-x">
        <SectionHead eyebrow="Offers & packages" title="Plan more, spend less" />
        <div className="grid gap-6 md:grid-cols-3">
          {live.map((o) => (
            <div key={o.id} className="flex flex-col rounded-2xl border border-gold/25 bg-white p-8">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold">{o.tag || 'Offer'}</span>
              <h3 className="mt-3 font-display text-2xl text-navy">{o.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{o.description}</p>
              {o.validTill && <p className="mt-3 text-sm text-slate-500">Valid till {o.validTill}</p>}
              <Link to={`/book?offer=${encodeURIComponent(o.title)}`} className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold text-masti-red">Enquire now <ArrowRight size={15} /></Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GalleryStrip({ gallery }) {
  const photos = gallery.filter((g) => g.type === 'image').slice(0, 5)
  if (photos.length < 3) return null
  return (
    <section className="py-24">
      <div className="container-x flex flex-wrap items-end justify-between gap-4">
        <SectionHead center={false} eyebrow="Gallery" title="Moments from the park" />
        <Link to="/gallery" className="btn-line mb-12">Full gallery <ArrowRight size={16} /></Link>
      </div>
      <div className="container-x grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
        {photos.map((p, i) => (
          <Link key={p.id} to="/gallery" className={cls('group overflow-hidden rounded-2xl', i === 0 && 'col-span-2 row-span-2')}>
            <img src={p.src} alt={p.caption || ''} loading="lazy" className="h-full min-h-44 w-full object-cover transition duration-700 group-hover:scale-105" />
          </Link>
        ))}
      </div>
    </section>
  )
}

function Facilities() {
  const list = [
    { icon: ShieldCheck, title: 'Trained lifeguards', text: 'Posted at every pool and slide exit.' },
    { icon: Utensils, title: 'Food court', text: 'Gujarati, Punjabi, snacks and drinks.' },
    { icon: Lock, title: 'Lockers & changing', text: 'Clean changing rooms and secure lockers.' },
    { icon: Car, title: 'Free parking', text: 'Ample space for cars, buses and bikes.' },
  ]
  return (
    <section className="border-y border-line bg-white">
      <div className="container-x grid gap-8 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {list.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4">
            <Icon size={28} strokeWidth={1.5} className="shrink-0 text-gold" />
            <div><p className="font-display text-lg text-navy">{title}</p><p className="mt-1 text-sm text-slate-600">{text}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Faq({ faqs }) {
  const [open, setOpen] = useState(0)
  if (!faqs.length) return null
  return (
    <section className="container-x grid gap-12 py-24 lg:grid-cols-[.8fr_1.2fr]">
      <div>
        <SectionHead center={false} eyebrow="FAQ" title="Before you visit" text="Can't find your answer? Our team is happy to help on call or WhatsApp." />
        <Link to="/contact" className="btn-navy -mt-4">Contact us</Link>
      </div>
      <div className="divide-y divide-line border-y border-line">
        {faqs.map((f, i) => (
          <div key={f.id}>
            <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-xl text-navy" aria-expanded={open === i}>
              {f.q}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line">{open === i ? <Minus size={15} /> : <Plus size={15} />}</span>
            </button>
            {open === i && <p className="-mt-1 pb-6 pr-10 leading-relaxed text-slate-600">{f.a}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

function CallToAction() {
  const { settings } = useSite()
  return (
    <section className="relative overflow-hidden">
      <img src="/images/hero-slides.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-navy/85" />
      <div className="container-x relative py-24 text-center text-white">
        <span className="eyebrow justify-center"><span className="h-px w-8 bg-gold" /> Groups & events <span className="h-px w-8 bg-gold" /></span>
        <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold sm:text-5xl">Planning a school trip, company outing or birthday?</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">Share your date and group size and our team will reply on WhatsApp with the best package.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/book" className="btn-red px-8">Send booking request</Link>
          {settings.phones?.[0] && <a href={telHref(settings.phones[0])} className="btn-ghost px-8"><Phone size={16} /> {settings.phones[0]}</a>}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const { rides, tickets, offers, gallery, faqs } = useSite()
  return (
    <>
      <Hero />
      <InfoStrip />
      <About />
      <Zones rides={rides} />
      <FeaturedRides rides={rides} />
      <TicketsPreview tickets={tickets} />
      <Videos gallery={gallery} />
      <Offers offers={offers} />
      <GalleryStrip gallery={gallery} />
      <Facilities />
      <Faq faqs={faqs} />
      <CallToAction />
    </>
  )
}
