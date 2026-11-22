import { useSearchParams } from 'react-router-dom'
import { Phone, CalendarCheck, MessageCircle, Wallet } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { PageHero } from '../components/ui'
import EnquiryForm from '../components/EnquiryForm'
import { telHref } from '../lib/utils'

export default function Book() {
  const { settings } = useSite()
  const [params] = useSearchParams()
  const steps = [
    { icon: CalendarCheck, title: 'Fill in your visit', text: 'Date, ticket type and number of guests.' },
    { icon: MessageCircle, title: 'Send on WhatsApp', text: 'Your details open in WhatsApp — just press Send.' },
    { icon: Phone, title: 'We confirm', text: 'Our team replies with availability and the best price.' },
    { icon: Wallet, title: 'Pay at the gate', text: 'Cash, card or UPI on arrival.' },
  ]
  return (
    <>
      <PageHero eyebrow="Book a visit" title="Reserve your day at the park" text="Booking takes under a minute and is confirmed directly on WhatsApp." image="/images/hero-main.webp" />
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <span className="eyebrow"><span className="h-px w-8 bg-gold" /> How it works</span>
          <ol className="mt-6 grid gap-6">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/40 text-gold"><Icon size={20} /></span>
                <div>
                  <p className="font-display text-xl text-navy"><span className="text-gold">0{i + 1}.</span> {title}</p>
                  <p className="text-slate-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-2xl bg-navy p-7 text-white">
            <p className="font-display text-xl">Prefer to talk?</p>
            <p className="mt-1 text-sm text-white/60">Call us between {settings.timings?.weekday}.</p>
            <div className="mt-4 grid gap-1">
              {settings.phones?.map((p) => <a key={p} href={telHref(p)} className="font-display text-2xl text-gold hover:underline">{p}</a>)}
            </div>
          </div>
        </div>
        <EnquiryForm kind="booking" preset={{ ticket: params.get('ticket'), offer: params.get('offer') }} />
      </section>
    </>
  )
}
