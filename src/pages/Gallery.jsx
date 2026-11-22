import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { PageHero, YouTubeCard, Modal } from '../components/ui'
import { cls } from '../lib/utils'

export default function Gallery() {
  const { gallery } = useSite()
  const [tab, setTab] = useState('all')
  const [index, setIndex] = useState(-1)

  const photos = gallery.filter((g) => g.type === 'image')
  const videos = gallery.filter((g) => g.type === 'video')
  const showPhotos = tab !== 'videos'
  const showVideos = tab !== 'photos'
  const step = (d) => setIndex((i) => (i + d + photos.length) % photos.length)

  return (
    <>
      <PageHero eyebrow="Gallery" title="Photos & videos" text="A look around the park — slides, pools and happy faces." image="/images/gallery-01.webp" />
      <section className="container-x py-16">
        <div className="mx-auto mb-12 flex w-fit rounded-full border border-line p-1">
          {['all', 'photos', 'videos'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cls('rounded-full px-7 py-2.5 text-sm font-bold capitalize transition', tab === t ? 'bg-navy text-white' : 'text-slate-600 hover:text-navy')}>
              {t}
            </button>
          ))}
        </div>

        {showVideos && videos.length > 0 && (
          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => <YouTubeCard key={v.id} url={v.src} caption={v.caption} />)}
          </div>
        )}

        {showPhotos && (photos.length ? (
          <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4">
            {photos.map((p, i) => (
              <button key={p.id} onClick={() => setIndex(i)} className="group relative block w-full overflow-hidden rounded-xl">
                <img src={p.src} alt={p.caption || 'Park photo'} loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
                {p.caption && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-4 text-left text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    {p.caption}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          tab === 'photos' && <p className="rounded-2xl bg-mist p-10 text-center text-slate-600">Photos are on their way. Meanwhile, watch the videos!</p>
        ))}
      </section>

      <Modal open={index >= 0} onClose={() => setIndex(-1)} wide>
        {photos[index] && (
          <div className="relative bg-black">
            <img src={photos[index].src} alt={photos[index].caption || ''} className="mx-auto max-h-[80vh] w-auto" />
            {photos[index].caption && <p className="bg-white p-4 font-display text-lg text-navy">{photos[index].caption}</p>}
            {photos.length > 1 && (
              <>
                <button onClick={() => step(-1)} aria-label="Previous" className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy"><ChevronLeft /></button>
                <button onClick={() => step(1)} aria-label="Next" className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy"><ChevronRight /></button>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
