import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { PageHero } from '../components/ui'

const PHOTOS = ['/images/hero-family.webp', '/images/hero-kids.webp', '/images/ride-rain-dance.webp', '/images/gallery-07.webp']

export default function Offers() {
  const { offers } = useSite()
  const live = offers.filter((o) => o.active !== false)
  return (
    <>
      <PageHero eyebrow="Deals & packages" title="Offers & packages" text="Group discounts, school picnics, birthdays and seasonal deals." image="/images/hero-family.webp" />
      <section className="container-x py-16">
        {live.length ? (
          <div className="grid gap-8 md:grid-cols-2">
            {live.map((o, i) => (
              <article key={o.id} className="group grid overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-[.9fr_1.1fr]">
                <div className="relative min-h-52 overflow-hidden">
                  <img src={PHOTOS[i % PHOTOS.length]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="flex flex-col p-7">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold">{o.tag || 'Offer'}</span>
                  <h2 className="mt-2 text-2xl text-navy">{o.title}</h2>
                  <p className="mt-3 leading-relaxed text-slate-600">{o.description}</p>
                  {o.validTill && <p className="mt-3 text-sm text-slate-500">Valid till {o.validTill}</p>}
                  <Link to={`/book?offer=${encodeURIComponent(o.title)}`} className="mt-auto inline-flex items-center gap-1 pt-6 text-sm font-bold text-masti-red">
                    Enquire on WhatsApp <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-mist p-10 text-center text-slate-600">No running offers right now — check back soon.</p>
        )}
      </section>
    </>
  )
}
