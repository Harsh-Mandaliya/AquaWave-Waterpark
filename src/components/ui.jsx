import { useEffect, useState } from 'react'
import { X, Play } from 'lucide-react'
import { youtubeId, youtubeThumb, cls } from '../lib/utils'

export function SectionHead({ eyebrow, title, text, center = true, light = false }) {
  return (
    <div className={cls('mb-12 max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <span className={cls('eyebrow', center && 'justify-center')}>
          <span className="h-px w-8 bg-gold" /> {eyebrow} {center && <span className="h-px w-8 bg-gold" />}
        </span>
      )}
      <h2 className={cls('mt-4 text-4xl font-semibold leading-[1.1] sm:text-5xl', light ? 'text-white' : 'text-navy')}>
        {title}
      </h2>
      {text && <p className={cls('mt-4 text-[17px] leading-relaxed', light ? 'text-white/75' : 'text-slate-600')}>{text}</p>}
    </div>
  )
}

export function Modal({ open, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-navy/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog" aria-modal="true"
        className={cls('reveal relative max-h-[90vh] w-full overflow-auto rounded-2xl bg-white shadow-2xl', wide ? 'max-w-4xl' : 'max-w-lg')}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-navy shadow hover:bg-navy hover:text-white">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}

// Shows the YouTube thumbnail first and only loads the player when tapped.
export function YouTubeCard({ url, caption, className = '' }) {
  const [playing, setPlaying] = useState(false)
  const id = youtubeId(url)
  if (!id) return null
  return (
    <figure className={cls('group overflow-hidden rounded-2xl bg-navy', className)}>
      <div className="relative aspect-video">
        {playing ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={caption || 'Park video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button onClick={() => setPlaying(true)} className="absolute inset-0 h-full w-full" aria-label={`Play ${caption || 'video'}`}>
            <img src={youtubeThumb(url)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-white/15 text-white backdrop-blur transition group-hover:scale-110 group-hover:bg-white group-hover:text-navy">
              <Play size={24} className="ml-1" fill="currentColor" />
            </span>
            {caption && <span className="absolute bottom-4 left-5 right-5 text-left font-display text-xl text-white">{caption}</span>}
          </button>
        )}
      </div>
    </figure>
  )
}

export function ThrillMeter({ level = 1, light = false }) {
  return (
    <span className="inline-flex items-end gap-[3px]" title={`Thrill level ${level} of 5`} aria-label={`Thrill level ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ height: 4 + n * 2.4 }}
          className={cls('w-[5px] rounded-sm', n <= level ? 'bg-gold' : light ? 'bg-white/30' : 'bg-slate-200')} />
      ))}
    </span>
  )
}

// Inner-page banner with a real photo behind.
export function PageHero({ title, text, eyebrow, image = '/images/banner-aerial.webp' }) {
  return (
    <section className="relative flex min-h-[420px] items-end overflow-hidden bg-navy pt-32 text-white">
      <img src={image} alt="" className="absolute inset-0 h-full w-full animate-pan object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/40" />
      <div className="container-x relative pb-14">
        {eyebrow && <span className="eyebrow"><span className="h-px w-8 bg-gold" /> {eyebrow}</span>}
        <h1 className="reveal mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] sm:text-6xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-lg text-white/80">{text}</p>}
      </div>
    </section>
  )
}
