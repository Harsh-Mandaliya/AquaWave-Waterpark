import { useEffect, useState } from 'react'
import { useSite } from '../context/SiteContext'
import { saveSettings, loadStarterContent } from '../lib/store'
import { Field, ImageInput, ListInput, YouTubeInput } from './fields'
import { useToast } from './toast'
import { PageHeader } from './AdminApp'
import { HERO_PHOTOS } from '../data/defaults'

// friendly names for the activity log
const FIELD_NAMES = {
  name: 'park name', shortName: 'short name', tagline: 'tagline', logo: 'logo', about: 'about text',
  heroTitle: 'headline', heroSubtitle: 'banner text', heroVideo: 'banner video', heroPhotos: 'banner photos', announcement: 'info bar',
  phones: 'phone numbers', whatsapp: 'WhatsApp number', email: 'email', address: 'address', mapLink: 'map link',
  timings: 'timings', stats: 'numbers strip', social: 'social links',
}

const SECTIONS = [
  ['brand', 'Brand'], ['home', 'Home page'], ['contact', 'Contact & WhatsApp'], ['timings', 'Timings'],
  ['numbers', 'Numbers strip'], ['social', 'Social media'], ['reset', 'Default content'],
]

function Section({ id, title, text, children }) {
  return (
    <section id={id} className="ad-card scroll-mt-20">
      <div className="border-b border-slate-200 px-5 py-3.5">
        <h2 className="text-[14.5px] font-semibold text-slate-900">{title}</h2>
        {text && <p className="mt-0.5 text-[12.5px] text-slate-500">{text}</p>}
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}
const Full = ({ children }) => <div className="sm:col-span-2">{children}</div>

export default function SettingsPage() {
  const { settings } = useSite()
  const [draft, setDraft] = useState(settings)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  // Pick up changes made elsewhere as long as there are no unsaved edits here.
  useEffect(() => { if (!dirty) setDraft(settings) }, [settings, dirty])

  // warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return
    const warn = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = (key) => (v) => { setDraft((d) => ({ ...d, [key]: v?.target ? v.target.value : v })); setDirty(true) }
  const setIn = (group, key) => (e) => { setDraft((d) => ({ ...d, [group]: { ...d[group], [key]: e.target.value } })); setDirty(true) }
  const setStat = (i, key) => (e) => {
    setDraft((d) => ({ ...d, stats: d.stats.map((s, j) => (j === i ? { ...s, [key]: e.target.value } : s)) }))
    setDirty(true)
  }
  const photos = draft.heroPhotos?.length ? draft.heroPhotos : HERO_PHOTOS

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const clean = { ...draft, phones: (draft.phones || []).map((p) => p.trim()).filter(Boolean) }
      const changed = Object.keys(clean).filter((k) => JSON.stringify(clean[k]) !== JSON.stringify(settings[k]))
      await saveSettings(clean, changed.map((k) => FIELD_NAMES[k] || k).join(', '))
      setDirty(false)
      toast('Settings saved. The website is updated.')
    } catch (err) {
      toast(err, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function restore() {
    if (!window.confirm('Replace ALL rides, tickets, offers, gallery, FAQs and site settings with the default content? Enquiries are kept. This cannot be undone.')) return
    try { await loadStarterContent(); setDirty(false); toast('Default content restored.') } catch (err) { toast(err, 'error') }
  }

  return (
    <form onSubmit={save} className="pb-20">
      <PageHeader title="Site settings" text="Name, logo, contact numbers, timings and home page text. Changes go live as soon as you save." />

      <div className="grid gap-6 lg:grid-cols-[180px_1fr]">
        <nav className="hidden lg:block">
          <ul className="sticky top-20 grid gap-0.5 text-[13px]">
            {SECTIONS.map(([id, label]) => (
              <li key={id}><a href={`#${id}`} className="block rounded-md px-2.5 py-1.5 text-slate-600 hover:bg-white hover:text-slate-900">{label}</a></li>
            ))}
          </ul>
        </nav>

        <div className="grid min-w-0 gap-5">
          <Section id="brand" title="Brand" text="Shown in the header, footer and browser tab.">
            <Field label="Park name"><input className="field" value={draft.name} onChange={set('name')} required /></Field>
            <Field label="Short name"><input className="field" value={draft.shortName} onChange={set('shortName')} /></Field>
            <Full><Field label="Tagline"><input className="field" value={draft.tagline} onChange={set('tagline')} /></Field></Full>
            <Full><Field label="Logo" hint="PNG with a transparent background looks best."><ImageInput value={draft.logo} onChange={set('logo')} maxSize={600} /></Field></Full>
            <Full><Field label="About the park" hint="Shown in the footer and the Welcome section."><textarea className="field min-h-24" value={draft.about} onChange={set('about')} /></Field></Full>
          </Section>

          <Section id="home" title="Home page" text="The large banner at the top of the home page.">
            <Full><Field label="Headline"><input className="field" value={draft.heroTitle} onChange={set('heroTitle')} /></Field></Full>
            <Full><Field label="Banner text"><textarea className="field" value={draft.heroSubtitle} onChange={set('heroSubtitle')} /></Field></Full>
            <Full><Field label="Background video (YouTube link)" hint="Plays muted behind the headline. Leave empty to show photo 1 instead."><YouTubeInput value={draft.heroVideo} onChange={set('heroVideo')} /></Field></Full>
            {[0, 1, 2, 3].map((i) => (
              <Field key={i} label={`Banner photo ${i + 1}`}>
                <ImageInput value={photos[i] || ''} onChange={(v) => { const list = [...photos]; list[i] = v || HERO_PHOTOS[i]; set('heroPhotos')(list) }} />
              </Field>
            ))}
            <Full><Field label="Top info bar" hint="Leave empty to show the opening hours."><input className="field" value={draft.announcement} onChange={set('announcement')} /></Field></Full>
          </Section>

          <Section id="contact" title="Contact & WhatsApp">
            <Field label="Phone numbers"><ListInput value={draft.phones} onChange={set('phones')} placeholder="+91 9xxxx xxxxx" /></Field>
            <div className="grid content-start gap-4">
              <Field label="WhatsApp booking number" hint="Booking requests from the website are sent to this number."><input className="field" value={draft.whatsapp} onChange={set('whatsapp')} /></Field>
              <Field label="Email"><input className="field" type="email" value={draft.email} onChange={set('email')} /></Field>
            </div>
            <Full><Field label="Address" hint="Also places the map on the Contact page."><textarea className="field" value={draft.address} onChange={set('address')} /></Field></Full>
            <Full><Field label="Google Maps link" hint="Used for the Get directions button."><input className="field" value={draft.mapLink} onChange={set('mapLink')} /></Field></Full>
          </Section>

          <Section id="timings" title="Timings">
            <Field label="Monday – Friday"><input className="field" value={draft.timings?.weekday || ''} onChange={setIn('timings', 'weekday')} /></Field>
            <Field label="Saturday – Sunday"><input className="field" value={draft.timings?.weekend || ''} onChange={setIn('timings', 'weekend')} /></Field>
            <Full><Field label="Note"><input className="field" value={draft.timings?.note || ''} onChange={setIn('timings', 'note')} /></Field></Full>
          </Section>

          <Section id="numbers" title="Numbers strip" text="The figures shown in the home page banner.">
            {(draft.stats || []).map((s, i) => (
              <div key={i} className="grid grid-cols-[100px_1fr] gap-2">
                <input className="field" value={s.value} onChange={setStat(i, 'value')} aria-label={`Figure ${i + 1}`} />
                <input className="field" value={s.label} onChange={setStat(i, 'label')} aria-label={`Label ${i + 1}`} />
              </div>
            ))}
          </Section>

          <Section id="social" title="Social media" text="Leave a field empty to hide that icon.">
            {['instagram', 'facebook', 'youtube'].map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)}><input className="field" value={draft.social?.[k] || ''} onChange={setIn('social', k)} placeholder="https://" /></Field>
            ))}
          </Section>

          <section id="reset" className="ad-card scroll-mt-20 border-red-200">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <h2 className="text-[14.5px] font-semibold text-slate-900">Restore default content</h2>
                <p className="mt-0.5 text-[12.5px] text-slate-500">Puts back the original rides, tickets, offers, gallery, FAQs and settings. Enquiries are not touched.</p>
              </div>
              <button type="button" onClick={restore} className="ad-btn-danger">Restore defaults</button>
            </div>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white lg:left-60">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-4 py-2.5 sm:px-6">
          <span className="mr-auto text-[12.5px] text-slate-500">{dirty ? <b className="font-medium text-amber-700">You have unsaved changes</b> : 'All changes saved'}</span>
          <button type="button" disabled={!dirty} onClick={() => { setDraft(settings); setDirty(false) }} className="ad-btn-outline">Discard</button>
          <button className="ad-btn-primary" disabled={saving || !dirty}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </form>
  )
}
