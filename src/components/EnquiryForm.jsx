import { useMemo, useState } from 'react'
import { CheckCircle2, MessageCircle, Minus, Plus, AlertCircle } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { sendEnquiry } from '../lib/store'
import { rupee, whatsappHref, cls } from '../lib/utils'
import {
  validateEnquiry, normalizeIndianMobile, toGuestCount, localDate, addDays, VISIT_TYPES, MAX_GUESTS, MAX_DAYS_AHEAD,
} from '../lib/validate'

const SEP = '§'
const prettyDate = (iso) =>
  iso ? new Date(iso + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''
const titleCase = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)

// The booking / contact form. On submit it:
//  1. checks every field (same rules are enforced again by the database)
//  2. opens WhatsApp with a ready-made message to the park's WhatsApp number (from admin settings)
//  3. saves the same details in the database so they appear in Admin → Enquiries
export default function EnquiryForm({ kind = 'booking', preset = {} }) {
  const { tickets, settings } = useSite()
  const booking = kind === 'booking'
  const today = localDate()
  const ticketIds = tickets.map((t) => t.id)

  const [form, setForm] = useState({
    name: '', phone: '', email: '', date: '', adults: '2', kids: '0',
    ticket: preset.ticket || '', // tickets may still be loading; validation checks it against the list on submit
    groupType: preset.offer ? 'offer' : 'family',
    message: preset.offer ? `Interested in: ${preset.offer}` : '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState({ done: false, error: '', link: '', saved: 'idle' })

  const update = (k, v) => {
    const next = { ...form, [k]: v }
    setForm(next)
    // after the first submit attempt, re-check while the visitor corrects things
    if (touched) {
      const found = validateEnquiry(next, { kind, ticketIds, today })
      setErrors(found)
      if (!Object.keys(found).length) setState((s) => ({ ...s, error: '' }))
    }
  }
  const set = (k) => (e) => update(k, e.target.value)
  const fieldCls = (k) => cls('field', errors[k] && 'border-masti-red focus:border-masti-red focus:ring-red-100')

  const ticketName = tickets.find((t) => t.id === form.ticket)?.title || ''

  const estimate = useMemo(() => {
    if (!booking || !form.date) return null
    const day = new Date(form.date + 'T00:00').getDay()
    const weekend = day === 0 || day === 6
    const price = (t) => Number(weekend ? t?.priceWeekend : t?.priceWeekday) || 0
    const isKid = (t) => /kid|child/i.test(t?.title || '')
    const isAdult = (t) => /adult/i.test(t?.title || '')
    const chosen = tickets.find((t) => t.id === form.ticket)
    const adultTicket = tickets.find(isAdult) || tickets.find((t) => !isKid(t))
    const kidTicket = tickets.find(isKid)
    // Kids ticket chosen -> adults still pay the adult rate. Combo/package -> everyone on that package.
    const adultT = !chosen || isKid(chosen) ? adultTicket : chosen
    const kidT = chosen && !isKid(chosen) && !isAdult(chosen) ? chosen : kidTicket || adultT
    const total = price(adultT) * (toGuestCount(form.adults) || 0) + price(kidT) * (toGuestCount(form.kids) || 0)
    return { total, weekend }
  }, [booking, form.date, form.ticket, form.adults, form.kids, tickets])

  function buildMessage() {
    const mobile = `+91 ${normalizeIndianMobile(form.phone)}`
    const lines = booking
      ? [
          `*New Booking Request – ${settings.name}*`,
          SEP,
          `Name: ${form.name.trim()}`,
          `Mobile: ${mobile}`,
          form.email.trim() && `Email: ${form.email.trim()}`,
          `Visit date: ${prettyDate(form.date)}`,
          `Ticket: ${ticketName}`,
          `Guests: ${toGuestCount(form.adults)} adult(s), ${toGuestCount(form.kids)} kid(s)`,
          `Visit type: ${titleCase(form.groupType)}`,
          estimate?.total ? `Estimated total: ${rupee(estimate.total)} (${estimate.weekend ? 'weekend' : 'weekday'} rate)` : '',
          form.message.trim() && `Note: ${form.message.trim()}`,
          SEP,
          'Please confirm availability. Thank you!',
        ]
      : [
          `*Website Enquiry – ${settings.name}*`,
          SEP,
          `Name: ${form.name.trim()}`,
          `Mobile: ${mobile}`,
          form.email.trim() && `Email: ${form.email.trim()}`,
          SEP,
          form.message.trim(),
        ]
    // drop empty optional lines; SEP marks the blank lines we actually want
    return lines.filter(Boolean).map((l) => (l === SEP ? '' : l)).join('\n')
  }

  function submit(e) {
    e.preventDefault()
    setTouched(true)
    const found = validateEnquiry(form, { kind, ticketIds, today })
    setErrors(found)
    if (Object.keys(found).length) {
      setState((s) => ({ ...s, error: 'Please correct the highlighted fields.' }))
      setTimeout(() => e.target.querySelector('[aria-invalid="true"]')?.focus(), 0)
      return
    }
    if (!settings.whatsapp) return setState((s) => ({ ...s, error: 'WhatsApp booking is not set up yet. Please call us.' }))

    // Open WhatsApp right away (inside the click) so browsers don't block it as a pop-up.
    const link = whatsappHref(settings.whatsapp, buildMessage())
    const win = window.open(link, '_blank')
    if (!win) window.location.href = link

    setState({ done: true, error: '', link, saved: 'saving' })
    e.target.scrollIntoView?.({ behavior: 'smooth', block: 'center' })

    // Save a copy for Admin → Enquiries. WhatsApp still works even if this fails.
    sendEnquiry({
      type: kind,
      name: form.name.trim(),
      phone: normalizeIndianMobile(form.phone),
      email: form.email.trim(),
      message: form.message.trim(),
      channel: 'whatsapp',
      ...(booking && {
        date: form.date,
        adults: toGuestCount(form.adults),
        kids: toGuestCount(form.kids),
        ticket: ticketName,
        groupType: form.groupType,
        estimate: Math.round(estimate?.total || 0),
      }),
    })
      .then(() => setState((s) => ({ ...s, saved: 'saved' })))
      .catch((err) => { console.error('Enquiry not saved:', err); setState((s) => ({ ...s, saved: 'failed' })) })
  }

  function reset() {
    setState({ done: false, error: '', link: '', saved: 'idle' })
    setTouched(false)
    setErrors({})
  }

  if (state.done) {
    return (
      <div className="reveal rounded-2xl border border-line bg-white p-10 text-center">
        <CheckCircle2 size={52} strokeWidth={1.5} className="mx-auto text-[#1a9e4b]" />
        <h3 className="mt-4 text-3xl text-navy">Almost done, {form.name.trim().split(' ')[0]}!</h3>
        <p className="mx-auto mt-2 max-w-sm text-slate-600">
          WhatsApp has opened with your {booking ? 'booking' : 'message'} details. Just press <b>Send</b> there and our team will confirm shortly.
        </p>
        <p className={cls('mx-auto mt-4 w-fit rounded-full px-4 py-1.5 text-xs font-bold',
          state.saved === 'saved' ? 'bg-green-50 text-green-700' : state.saved === 'failed' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500')}>
          {state.saved === 'saved' ? '✓ Request received by our booking desk'
            : state.saved === 'failed' ? 'Could not reach our system — please press Send in WhatsApp'
              : 'Saving your request…'}
        </p>
        <a href={state.link} target="_blank" rel="noreferrer" className="btn mt-6 bg-[#25d366] text-white hover:bg-[#1ebe5b]">
          <MessageCircle size={18} /> Open WhatsApp again
        </a>
        <button onClick={reset} className="mt-4 block w-full text-sm font-semibold text-slate-500 hover:text-navy">
          Make another {booking ? 'booking' : 'enquiry'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-5 rounded-2xl border border-line bg-white p-6 shadow-[0_30px_60px_-30px_rgba(11,37,69,.25)] sm:p-9">
      <div>
        <h2 className="text-3xl text-navy">{booking ? 'Booking request' : 'Send us a message'}</h2>
        <p className="mt-1 text-sm text-slate-500">Your details are sent to us on WhatsApp — no payment needed now.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Full name *</span>
          <input className={fieldCls('name')} value={form.name} onChange={set('name')} autoComplete="name" maxLength={60} aria-invalid={!!errors.name} />
          <Err msg={errors.name} />
        </label>
        <label>
          <span className="label">Mobile number *</span>
          <input
            className={fieldCls('phone')} value={form.phone} inputMode="tel" autoComplete="tel" placeholder="98765 43210" maxLength={16}
            onChange={(e) => update('phone', e.target.value.replace(/[^\d+\s-]/g, ''))} aria-invalid={!!errors.phone}
          />
          <Err msg={errors.phone} />
        </label>
      </div>
      <label>
        <span className="label">Email (optional)</span>
        <input className={fieldCls('email')} type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={100} aria-invalid={!!errors.email} />
        <Err msg={errors.email} />
      </label>

      {booking && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="label">Visit date *</span>
              <input
                className={fieldCls('date')} type="date" min={today} max={addDays(today, MAX_DAYS_AHEAD)}
                value={form.date} onChange={set('date')} aria-invalid={!!errors.date}
              />
              <Err msg={errors.date} />
            </label>
            <label>
              <span className="label">Ticket *</span>
              <select className={fieldCls('ticket')} value={form.ticket} onChange={set('ticket')} aria-invalid={!!errors.ticket}>
                <option value="" disabled>Select a ticket</option>
                {tickets.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <Err msg={errors.ticket} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Counter label="Adults *" hint="above 4 ft" value={form.adults} onChange={(v) => update('adults', v)} invalid={!!errors.adults} />
            <Counter label="Kids" hint="3 – 4 ft" value={form.kids} onChange={(v) => update('kids', v)} invalid={!!errors.kids} />
            <label>
              <span className="label">Visit type *</span>
              <select className={fieldCls('groupType')} value={form.groupType} onChange={set('groupType')} aria-invalid={!!errors.groupType}>
                {VISIT_TYPES.map((v) => <option key={v} value={v}>{titleCase(v)}</option>)}
              </select>
              <Err msg={errors.groupType} />
            </label>
          </div>
          {(errors.adults || errors.kids) && <div className="-mt-3"><Err msg={errors.adults} /><Err msg={errors.kids} /></div>}
          <p className="-mt-2 text-xs text-slate-500">Children under 3 ft enter free — no need to count them.</p>
        </>
      )}

      <label>
        <span className="label">{booking ? 'Special requests' : 'Your message *'}</span>
        <textarea className={cls(fieldCls('message'), 'min-h-28')} value={form.message} onChange={set('message')} maxLength={500} aria-invalid={!!errors.message} />
        <span className="mt-1 flex items-start justify-between gap-3">
          <Err msg={errors.message} />
          <span className="ml-auto text-xs text-slate-400">{form.message.length}/500</span>
        </span>
      </label>

      {estimate && estimate.total > 0 && !errors.date && (
        <div className="flex items-center justify-between rounded-xl bg-cream px-5 py-4">
          <span className="text-sm font-semibold text-slate-600">Estimated total <span className="text-slate-400">({estimate.weekend ? 'weekend' : 'weekday'} rate)</span></span>
          <span className="font-display text-3xl text-navy">{rupee(estimate.total)}</span>
        </div>
      )}

      {state.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-masti-red">{state.error}</p>}

      <button className="btn bg-[#25d366] py-3.5 text-[15px] text-white hover:bg-[#1ebe5b] focus-visible:ring-green-200">
        <MessageCircle size={19} /> {booking ? 'Book on WhatsApp' : 'Send on WhatsApp'}
      </button>
      <p className="text-center text-xs text-slate-500">You pay at the park. Our team confirms availability on WhatsApp or by phone.</p>
    </form>
  )
}

function Err({ msg }) {
  if (!msg) return null
  return (
    <span role="alert" className="mt-1 flex items-start gap-1 text-xs font-semibold text-masti-red">
      <AlertCircle size={13} className="mt-px shrink-0" /> {msg}
    </span>
  )
}

// +/- stepper for guest counts. Only whole numbers 0..MAX_GUESTS can be typed — no minus sign, no decimals.
function Counter({ label, hint, value, onChange, invalid }) {
  const n = toGuestCount(value) ?? 0
  const setN = (v) => onChange(String(Math.max(0, Math.min(MAX_GUESTS, v))))
  return (
    <div>
      <span className="label">{label} {hint && <span className="font-normal text-slate-400">({hint})</span>}</span>
      <div className={cls('flex h-[46px] items-stretch overflow-hidden rounded-lg border bg-white', invalid ? 'border-masti-red' : 'border-line')}>
        <button type="button" aria-label={`Fewer ${label}`} onClick={() => setN(n - 1)} disabled={n <= 0}
          className="grid w-11 shrink-0 place-items-center text-navy hover:bg-mist disabled:opacity-30">
          <Minus size={16} />
        </button>
        <input
          className="w-full min-w-0 border-x border-line text-center text-[15px] font-bold text-navy outline-none"
          inputMode="numeric" aria-label={label} aria-invalid={invalid}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 3))}
          onBlur={() => setN(n)}
        />
        <button type="button" aria-label={`More ${label}`} onClick={() => setN(n + 1)} disabled={n >= MAX_GUESTS}
          className="grid w-11 shrink-0 place-items-center text-navy hover:bg-mist disabled:opacity-30">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
