import { Ruler, ArrowUpRight } from 'lucide-react'
import { ThrillMeter } from './ui'

const LABEL = { water: 'Water ride', thrill: 'Thrill slide', kids: 'Kids zone', adventure: 'Adventure' }
const FALLBACK = {
  water: '/images/hero-slides.webp',
  thrill: '/images/ride-tornado.webp',
  kids: '/images/ride-kids-pool.webp',
  adventure: '/images/ride-zipline.webp',
}

export function RideImage({ ride, className = '' }) {
  return (
    <img
      src={ride.image || FALLBACK[ride.category] || FALLBACK.water}
      alt={ride.name} loading="lazy"
      className={`object-cover ${className}`}
    />
  )
}

export default function RideCard({ ride, onOpen }) {
  return (
    <button
      onClick={() => onOpen?.(ride)}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-navy text-left"
    >
      <RideImage ride={ride} className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-[1.06]" />
      <span className="absolute inset-0 bg-gradient-to-t from-navy via-navy/25 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-navy backdrop-blur">
        {LABEL[ride.category] || ride.category}
      </span>
      <span className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/0 text-white opacity-0 ring-1 ring-white/50 transition group-hover:bg-white group-hover:text-navy group-hover:opacity-100">
        <ArrowUpRight size={18} />
      </span>
      <span className="absolute inset-x-0 bottom-0 p-5 text-white">
        <span className="block font-display text-2xl font-semibold leading-tight">{ride.name}</span>
        <span className="mt-1.5 line-clamp-2 block text-sm text-white/75">{ride.description}</span>
        <span className="mt-4 flex items-center justify-between border-t border-white/20 pt-3 text-[13px] font-semibold text-white/85">
          <span className="flex items-center gap-1.5"><Ruler size={14} className="text-gold" /> {ride.minHeight || 'All heights'}</span>
          <ThrillMeter level={Number(ride.thrill) || 1} light />
        </span>
      </span>
    </button>
  )
}

export { LABEL as RIDE_LABEL }
