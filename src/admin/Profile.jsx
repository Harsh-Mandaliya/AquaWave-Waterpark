import { useEffect, useRef, useState } from 'react'
import { Camera, Eye, EyeOff, Trash2 } from 'lucide-react'
import { saveProfile, changePassword, mode } from '../lib/store'
import { compressImage, cls } from '../lib/utils'
import { normalizeIndianMobile } from '../lib/validate'
import { useToast } from './toast'
import { useAdmin, PageHeader, Avatar } from './AdminApp'

function strength(pw) {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(4, s)
}
const STRENGTH = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']

function Card({ title, text, children, footer }) {
  return (
    <section className="ad-card">
      <div className="border-b border-slate-200 px-5 py-3.5">
        <h2 className="text-[14.5px] font-semibold text-slate-900">{title}</h2>
        {text && <p className="mt-0.5 text-[12.5px] text-slate-500">{text}</p>}
      </div>
      <div className="p-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</div>}
    </section>
  )
}

function PasswordInput({ value, onChange, autoComplete, invalid }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative block">
      <input className={cls('field pr-10', invalid && 'border-red-400')} type={show ? 'text' : 'password'} value={value}
        onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} aria-invalid={invalid} />
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </span>
  )
}

export default function Profile() {
  const { profile } = useAdmin()
  const toast = useToast()
  const fileRef = useRef(null)

  const [form, setForm] = useState({ name: '', phone: '', photo: '' })
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState({})

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [pwErr, setPwErr] = useState({})
  const [pwBusy, setPwBusy] = useState(false)

  useEffect(() => {
    if (!dirty) setForm({ name: profile.name || '', phone: profile.phone || '', photo: profile.photo || '' })
  }, [profile, dirty])

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setDirty(true) }

  async function pickPhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try { set('photo', await compressImage(file, 320, 0.82)) } catch (x) { toast(x.message, 'error') }
  }

  async function saveDetails(e) {
    e.preventDefault()
    const found = {}
    if (form.name.trim().length < 2) found.name = 'Please enter your name.'
    if (form.phone.trim() && !normalizeIndianMobile(form.phone)) found.phone = 'Enter a valid 10-digit mobile number.'
    setErr(found)
    if (Object.keys(found).length) return
    setSaving(true)
    try { await saveProfile(form); setDirty(false); toast('Profile updated.') } catch (x) { toast(x, 'error') } finally { setSaving(false) }
  }

  async function savePassword(e) {
    e.preventDefault()
    const found = {}
    if (!pw.current) found.current = 'Enter your current password.'
    if (pw.next.length < 8) found.next = 'Use at least 8 characters.'
    else if (strength(pw.next) < 2) found.next = 'Add capital letters, numbers or symbols.'
    else if (pw.next === pw.current) found.next = 'The new password must be different.'
    if (pw.confirm !== pw.next) found.confirm = 'The two passwords do not match.'
    setPwErr(found)
    if (Object.keys(found).length) return
    setPwBusy(true)
    try {
      await changePassword(pw.current, pw.next)
      setPw({ current: '', next: '', confirm: '' })
      toast('Password changed.')
    } catch (x) {
      if (/current password/i.test(x.message)) setPwErr({ current: x.message })
      else toast(x, 'error')
    } finally { setPwBusy(false) }
  }

  const s = strength(pw.next)
  const ErrText = ({ m }) => (m ? <span className="mt-1 block text-[12px] text-red-600">{m}</span> : null)

  return (
    <div className="max-w-3xl">
      <PageHeader title="My profile" text="Your name and photo appear in the admin area and the activity log." />

      <div className="grid gap-5">
        <form onSubmit={saveDetails}>
          <Card
            title="Personal details"
            footer={<>
              <button type="button" disabled={!dirty} onClick={() => setDirty(false)} className="ad-btn-outline">Cancel</button>
              <button className="ad-btn-primary" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save details'}</button>
            </>}
          >
            <div className="flex flex-wrap items-center gap-4">
              <Avatar profile={{ ...profile, ...form }} size={72} />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="ad-btn-outline"><Camera size={15} /> {form.photo ? 'Change photo' : 'Upload photo'}</button>
                {form.photo && <button type="button" onClick={() => set('photo', '')} className="ad-btn-ghost hover:text-red-600"><Trash2 size={15} /> Remove</button>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Full name</span>
                <input className={cls('field', err.name && 'border-red-400')} value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={60} autoComplete="name" />
                <ErrText m={err.name} />
              </label>
              <label>
                <span className="label">Mobile number</span>
                <input className={cls('field', err.phone && 'border-red-400')} value={form.phone} onChange={(e) => set('phone', e.target.value.replace(/[^\d+\s-]/g, ''))} maxLength={16} inputMode="tel" autoComplete="tel" />
                <ErrText m={err.phone} />
              </label>
              <label>
                <span className="label">Email</span>
                <input className="field bg-slate-50 text-slate-500" value={profile.email || ''} readOnly />
                <span className="mt-1 block text-[12px] text-slate-400">Used to sign in. Ask the owner to change it.</span>
              </label>
              <div>
                <span className="label">Role</span>
                <p className="flex h-[38px] items-center"><span className="rounded bg-slate-100 px-2 py-0.5 text-[12.5px] font-medium capitalize text-slate-700">{profile.role || 'admin'}</span></p>
              </div>
            </div>
          </Card>
        </form>

        <form onSubmit={savePassword}>
          <Card
            title="Password"
            text={mode === 'demo' ? 'Password changes are not available in preview mode.' : 'For your security, enter your current password first.'}
            footer={<button className="ad-btn-primary" disabled={pwBusy || mode === 'demo'}>{pwBusy ? 'Updating…' : 'Update password'}</button>}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 sm:max-w-sm">
                <span className="label">Current password</span>
                <PasswordInput value={pw.current} onChange={(v) => setPw((p) => ({ ...p, current: v }))} autoComplete="current-password" invalid={!!pwErr.current} />
                <ErrText m={pwErr.current} />
              </label>
              <label>
                <span className="label">New password</span>
                <PasswordInput value={pw.next} onChange={(v) => setPw((p) => ({ ...p, next: v }))} autoComplete="new-password" invalid={!!pwErr.next} />
                {pw.next && (
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="flex flex-1 gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <span key={i} className={cls('h-1 flex-1 rounded-full', i < s ? (s < 2 ? 'bg-red-400' : s < 3 ? 'bg-amber-400' : 'bg-emerald-500') : 'bg-slate-200')} />
                      ))}
                    </span>
                    <span className="text-[11.5px] text-slate-500">{STRENGTH[s]}</span>
                  </span>
                )}
                <ErrText m={pwErr.next} />
              </label>
              <label>
                <span className="label">Confirm new password</span>
                <PasswordInput value={pw.confirm} onChange={(v) => setPw((p) => ({ ...p, confirm: v }))} autoComplete="new-password" invalid={!!pwErr.confirm} />
                <ErrText m={pwErr.confirm} />
              </label>
            </div>
          </Card>
        </form>
      </div>
    </div>
  )
}
