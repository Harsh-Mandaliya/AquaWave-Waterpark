import CollectionManager from './CollectionManager'
import { RideImage, RIDE_LABEL } from '../components/RideCard'
import { rupee, youtubeThumb } from '../lib/utils'

const CATS = [['water', 'Water ride'], ['thrill', 'Thrill slide'], ['kids', 'Kids zone'], ['adventure', 'Adventure park']]

export function RidesAdmin() {
  return (
    <CollectionManager
      name="rides" title="Rides"
      intro="Water rides, thrill slides, kids zone and adventure activities shown on the Rides page."
      blank={{ name: '', category: 'water', description: '', minHeight: '', thrill: 3, featured: false, image: '' }}
      schema={[
        { key: 'name', label: 'Ride name' },
        { key: 'category', label: 'Zone', type: 'select', options: CATS },
        { key: 'description', label: 'Short description', type: 'textarea', full: true },
        { key: 'minHeight', label: 'Height rule', hint: 'e.g. "4 ft" or "below 4 ft". Leave empty for all heights.' },
        { key: 'thrill', label: 'Thrill level', type: 'select', options: [1, 2, 3, 4, 5].map((n) => [n, `${n} / 5`]) },
        { key: 'featured', label: 'Show on home page', type: 'checkbox', checkboxText: 'Featured ride' },
        { key: 'image', label: 'Photo', type: 'image', full: true, hint: 'Optional. Without a photo, a standard photo for that zone is shown.' },
      ]}
      renderRow={(r) => (
        <div className="flex items-center gap-3">
          <RideImage ride={r} className="h-11 w-16 shrink-0 rounded-md" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-slate-900">{r.name} {r.featured && <span className="ml-1 rounded bg-amber-50 px-1.5 py-px text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">Featured</span>}</p>
            <p className="text-[12.5px] text-slate-500">{RIDE_LABEL[r.category]} · {r.minHeight || 'All heights'}</p>
          </div>
        </div>
      )}
    />
  )
}

export function TicketsAdmin() {
  return (
    <CollectionManager
      name="tickets" title="Tickets"
      intro="Price cards on the Tickets page. The booking estimate uses the ticket whose name contains “Kids” or “Child” for children."
      blank={{ title: '', subtitle: '', priceWeekday: '', priceWeekend: '', includes: [], highlight: false }}
      schema={[
        { key: 'title', label: 'Ticket name' },
        { key: 'subtitle', label: 'Who is it for', placeholder: 'Height above 4 ft' },
        { key: 'priceWeekday', label: 'Weekday price (₹)', type: 'number' },
        { key: 'priceWeekend', label: 'Weekend price (₹)', type: 'number' },
        { key: 'includes', label: "What's included", type: 'list', full: true, placeholder: 'All water rides' },
        { key: 'highlight', label: 'Highlight', type: 'checkbox', checkboxText: 'Mark as "Most popular"' },
      ]}
      renderRow={(t) => (
        <div>
          <p className="text-[13.5px] font-medium text-slate-900">{t.title} {t.highlight && <span className="ml-1 rounded bg-amber-50 px-1.5 py-px text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">Popular</span>}</p>
          <p className="text-[12.5px] text-slate-500">{rupee(t.priceWeekday)} weekday · {rupee(t.priceWeekend)} weekend</p>
        </div>
      )}
    />
  )
}

export function OffersAdmin() {
  return (
    <CollectionManager
      name="offers" title="Offers"
      intro="Deals and packages. Untick “Active” to hide an offer without deleting it."
      blank={{ title: '', description: '', tag: '', validTill: '', active: true }}
      schema={[
        { key: 'title', label: 'Offer title' },
        { key: 'tag', label: 'Label', placeholder: 'Diwali / Groups / Schools' },
        { key: 'description', label: 'Details', type: 'textarea', full: true },
        { key: 'validTill', label: 'Valid till', placeholder: '31 Dec 2026' },
        { key: 'active', label: 'Status', type: 'checkbox', checkboxText: 'Active (visible on site)' },
      ]}
      renderRow={(o) => (
        <div>
          <p className="text-[13.5px] font-medium text-slate-900">{o.title} {o.active === false && <span className="ml-1 rounded bg-slate-100 px-1.5 py-px text-[11px] font-medium text-slate-600">Hidden</span>}</p>
          <p className="truncate text-[12.5px] text-slate-500">{o.description}</p>
        </div>
      )}
    />
  )
}

export function GalleryAdmin() {
  return (
    <CollectionManager
      name="gallery" title="Gallery" singular="photo or video"
      intro="Photos (upload from phone/computer) and YouTube videos. The first 3 videos also appear on the home page."
      blank={{ type: 'image', src: '', caption: '' }}
      schema={[
        { key: 'type', label: 'Type', type: 'select', options: [['image', 'Photo'], ['video', 'YouTube video']] },
        { key: 'caption', label: 'Caption' },
        { id: 'photo', key: 'src', label: 'Photo', type: 'image', full: true, show: (d) => d.type !== 'video' },
        { id: 'video', key: 'src', label: 'YouTube link', type: 'youtube', full: true, show: (d) => d.type === 'video' },
      ]}
      renderRow={(g) => (
        <div className="flex items-center gap-3">
          <img src={g.type === 'video' ? youtubeThumb(g.src) : g.src} alt="" className="h-11 w-16 shrink-0 rounded-md bg-slate-100 object-cover" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-medium text-slate-900">{g.caption || 'Untitled'}</p>
            <p className="text-[12.5px] text-slate-500">{g.type === 'video' ? 'YouTube video' : 'Photo'}</p>
          </div>
        </div>
      )}
    />
  )
}

export function FaqsAdmin() {
  return (
    <CollectionManager
      name="faqs" title="FAQs" singular="question"
      intro="Questions shown on the home and tickets pages."
      blank={{ q: '', a: '' }}
      schema={[
        { key: 'q', label: 'Question', full: true },
        { key: 'a', label: 'Answer', type: 'textarea', full: true },
      ]}
      renderRow={(f) => (
        <div>
          <p className="text-[13.5px] font-medium text-slate-900">{f.q}</p>
          <p className="truncate text-[12.5px] text-slate-500">{f.a}</p>
        </div>
      )}
    />
  )
}
