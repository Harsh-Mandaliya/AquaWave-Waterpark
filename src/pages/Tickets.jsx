import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Clock, Info, Plus, Minus } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { PageHero, SectionHead } from '../components/ui'
import { rupee, isWeekend, cls } from '../lib/utils'

const RULES = [
  'Ticket type is decided by height at the gate, not by age.',
  'Children below 3 ft enter free with a paying adult.',
  'Proper nylon / lycra swimwear is compulsory in pools and slides.',
  'Outside food, alcohol and glass bottles are not allowed.',
  'Please follow lifeguard instructions on every ride.',
]

export default function Tickets() {
  const { tickets, settings, faqs } = useSite()
  const [weekend, setWeekend] = useState(isWeekend())
  const [open, setOpen] = useState(-1)

  return (
    <>
      <PageHero eyebrow="Tickets & timings" title="Ticket prices" text="All-day entry to every ride in your pass. Choose a day and a ticket." image="/images/hero-slides.webp" />

      <section className="container-x py-16">
        <div className="mx-auto mb-12 flex w-fit rounded-full border border-line p-1">
          {[['Weekdays', false], ['Weekends', true]].map(([label, val]) => (
            <button key={label} onClick={() => setWeekend(val)}
              className={cls('rounded-full px-7 py-2.5 text-sm font-bold transition', weekend === val ? 'bg-navy text-white' : 'text-slate-600 hover:text-navy')}>
              {label}
            </button>
          ))}
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {tickets.map((t) => (
            <div key={t.id} className={cls('relative flex flex-col rounded-2xl p-8', t.highlight ? 'bg-navy text-white shadow-2xl' : 'border border-line bg-white')}>
              {t.highlight && <span className="absolute right-6 top-6 rounded-full bg-gold px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-navy">Popular</span>}
              <h2 className="text-3xl">{t.title}</h2>
              <p className={cls('text-sm', t.highlight ? 'text-white/60' : 'text-slate-500')}>{t.subtitle}</p>
              <p className="mt-6 font-display text-6xl">{rupee(weekend ? t.priceWeekend : t.priceWeekday)}</p>
              <p className={cls('mt-1 text-sm', t.highlight ? 'text-white/60' : 'text-slate-500')}>per person · {weekend ? 'Sat – Sun' : 'Mon – Fri'}</p>
              <ul className={cls('mt-6 grid gap-2.5 border-t pt-6', t.highlight ? 'border-white/15' : 'border-line')}>
                {(t.includes || []).map((inc) => <li key={inc} className="flex gap-2"><Check size={17} className="mt-0.5 shrink-0 text-gold" /> {inc}</li>)}
              </ul>
              <Link to={`/book?ticket=${t.id}`} className="mt-auto w-full pt-8">
                <span className={cls('w-full', t.highlight ? 'btn-red' : 'btn-navy')}>Book now</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-6 pb-16 lg:grid-cols-2">
        <div className="rounded-2xl border border-line p-8">
          <h3 className="flex items-center gap-3 text-2xl text-navy"><Clock className="text-gold" /> Park timings</h3>
          <dl className="mt-6 divide-y divide-line">
            <div className="flex justify-between py-3"><dt className="font-semibold">Monday – Friday</dt><dd>{settings.timings?.weekday}</dd></div>
            <div className="flex justify-between py-3"><dt className="font-semibold">Saturday – Sunday</dt><dd>{settings.timings?.weekend}</dd></div>
          </dl>
          {settings.timings?.note && <p className="mt-3 text-sm text-slate-500">{settings.timings.note}</p>}
        </div>
        <div className="rounded-2xl bg-cream p-8">
          <h3 className="flex items-center gap-3 text-2xl text-navy"><Info className="text-gold" /> Park rules</h3>
          <ul className="mt-6 grid gap-3">
            {RULES.map((r) => <li key={r} className="flex gap-2 text-slate-700"><Check size={17} className="mt-0.5 shrink-0 text-gold" /> {r}</li>)}
          </ul>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="container-x pb-24">
          <SectionHead eyebrow="FAQ" title="Ticket questions" />
          <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
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
      )}
    </>
  )
}
