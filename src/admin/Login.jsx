import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useSite } from '../context/SiteContext'
import { adminLogin, adminLogout, mode, DEMO_LOGIN } from '../lib/store'

export default function Login({ notAdmin }) {
  const { settings } = useSite()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    try { await adminLogin(email, password) } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <div className="admin grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <img src="/images/hero-main.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <img src={settings.logo} alt="" className="h-16 w-auto" />
          <p className="mt-4 text-2xl font-semibold">{settings.name}</p>
          <p className="mt-1 text-sm text-white/70">Staff area — bookings, prices and website content.</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-[360px]">
          <img src={settings.logo} alt={settings.name} className="h-14 w-auto lg:hidden" />
          <h1 className="mt-6 text-[22px] font-semibold text-slate-900 lg:mt-0">Sign in</h1>
          <p className="mt-1 text-[13.5px] text-slate-500">Use your staff email and password.</p>

          {notAdmin ? (
            <div className="mt-6 grid gap-3">
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
                <b>{notAdmin}</b> does not have access to the admin area. Please ask the park owner to give you access.
              </p>
              <button onClick={adminLogout} className="ad-btn-outline">Sign in with another account</button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-4">
              <label>
                <span className="label">Email</span>
                <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
              </label>
              <label>
                <span className="label">Password</span>
                <span className="relative block">
                  <input className="field pr-10" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                  <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>
              {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{error}</p>}
              <button className="ad-btn-primary h-10" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
              {mode === 'demo' && (
                <p className="rounded-md bg-slate-50 p-3 text-[12px] text-slate-600">
                  Preview login: <b>{DEMO_LOGIN.email}</b> / <b>{DEMO_LOGIN.password}</b>
                </p>
              )}
            </form>
          )}
          <Link to="/" className="mt-8 inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-800"><ArrowLeft size={14} /> Back to website</Link>
        </div>
      </div>
    </div>
  )
}
