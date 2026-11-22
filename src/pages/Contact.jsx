import { MapPin, Phone, Clock, Navigation, Mail, MessageCircle } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { PageHero } from '../components/ui'
import EnquiryForm from '../components/EnquiryForm'
import { telHref, whatsappHref, mapEmbedSrc } from '../lib/utils'

export default function Contact() {
  const { settings } = useSite()
  const cards = [
    {
      icon: MapPin, title: 'Address',
      body: <>
        <p className="text-slate-600">{settings.address}</p>
        <a href={settings.mapLink} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-masti-red"><Navigation size={15} /> Get directions</a>
      </>,
    },
    {
      icon: Phone, title: 'Call or WhatsApp',
      body: <>
        {settings.phones?.map((p) => <a key={p} href={telHref(p)} className="block font-display text-xl text-navy hover:text-masti-red">{p}</a>)}
        {settings.whatsapp && <a href={whatsappHref(settings.whatsapp)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#1a9e4b]"><MessageCircle size={15} /> Chat on WhatsApp</a>}
        {settings.email && <a href={`mailto:${settings.email}`} className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Mail size={15} /> {settings.email}</a>}
      </>,
    },
    {
      icon: Clock, title: 'Opening hours',
      body: <>
        <p className="text-slate-600">Mon – Fri: <b className="text-navy">{settings.timings?.weekday}</b></p>
        <p className="text-slate-600">Sat – Sun: <b className="text-navy">{settings.timings?.weekend}</b></p>
        {settings.timings?.note && <p className="mt-2 text-sm text-slate-500">{settings.timings.note}</p>}
      </>,
    },
  ]

  return (
    <>
      <PageHero eyebrow="Contact" title="Plan your visit" text="Questions about tickets, groups or directions — our team is a call away." image="/images/gallery-03.webp" />

      <section className="container-x grid gap-6 py-16 md:grid-cols-3">
        {cards.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-line p-7">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 text-gold"><Icon size={20} /></span>
            <h2 className="mt-5 text-2xl text-navy">{title}</h2>
            <div className="mt-2">{body}</div>
          </div>
        ))}
      </section>

      <section className="container-x grid gap-8 pb-24 lg:grid-cols-2">
        <div className="min-h-[460px] overflow-hidden rounded-2xl border border-line">
          <iframe title={`${settings.name} on Google Maps`} src={mapEmbedSrc(settings.address)} className="h-full min-h-[460px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <EnquiryForm kind="contact" />
      </section>
    </>
  )
}
