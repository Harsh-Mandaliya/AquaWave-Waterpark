import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSite } from '../context/SiteContext'
import { PageHero } from '../components/ui'
import RideCard from '../components/RideCard'
import RideModal from '../components/RideModal'
import { RIDE_CATEGORIES } from '../data/defaults'
import { cls } from '../lib/utils'

const HERO = {
  adventure: ['Adventure Park', 'Dry-land adrenaline — zipline, rope course, climbing wall and more.', '/images/ride-rope-course.webp'],
  kids: ['Kids Zone', 'Shallow water, gentle slides and lifeguards who love kids.', '/images/hero-kids.webp'],
  thrill: ['Thrill Slides', 'Steep drops and fast turns for those who like their heart racing.', '/images/ride-tornado.webp'],
  water: ['Water Rides', 'Wave pool, lazy river, rain dance and family slides.', '/images/ride-wave-pool.webp'],
}

export default function Rides() {
  const { rides } = useSite()
  const [params, setParams] = useSearchParams()
  const [active, setActive] = useState(null)
  const cat = params.get('cat') || 'all'
  const list = cat === 'all' ? rides : rides.filter((r) => r.category === cat)
  const [title, text, image] = HERO[cat] || ['Rides & Attractions', 'Every slide, pool and adventure in the park. Select a ride to see height rules and thrill level.', '/images/banner-resort.webp']

  return (
    <>
      <PageHero eyebrow="Explore the park" title={title} text={text} image={image} />
      <section className="container-x py-16">
        <div className="no-scrollbar -mx-4 mb-12 flex gap-8 overflow-x-auto border-b border-line px-4 sm:justify-center">
          {RIDE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setParams(c.id === 'all' ? {} : { cat: c.id })}
              className={cls('-mb-px shrink-0 border-b-2 pb-4 text-[15px] font-bold transition', cat === c.id ? 'border-gold text-navy' : 'border-transparent text-slate-500 hover:text-navy')}
            >
              {c.label}
            </button>
          ))}
        </div>

        {list.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => <RideCard key={r.id} ride={r} onOpen={setActive} />)}
          </div>
        ) : (
          <p className="rounded-2xl bg-mist p-10 text-center text-slate-600">New attractions coming soon in this zone.</p>
        )}
      </section>
      <RideModal ride={active} onClose={() => setActive(null)} />
    </>
  )
}
