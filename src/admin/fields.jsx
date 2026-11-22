import { useRef, useState } from 'react'
import { Upload, Trash2, Plus } from 'lucide-react'
import { compressImage, youtubeThumb } from '../lib/utils'

// Reusable form inputs for the admin panel.

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function ImageInput({ value, onChange, maxSize = 1400 }) {
  const ref = useRef(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setErr(''); setBusy(true)
    try { onChange(await compressImage(file, maxSize)) } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <span className="text-xs text-slate-400">No image</span>}
      </div>
      <div className="grid min-w-0 flex-1 gap-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => ref.current?.click()} className="ad-btn-outline h-8" disabled={busy}>
            <Upload size={15} /> {busy ? 'Processing…' : 'Upload'}
          </button>
          {value && <button type="button" onClick={() => onChange('')} className="ad-btn-ghost h-8 hover:text-red-600"><Trash2 size={15} /> Remove</button>}
        </div>
        <input
          className="field h-8 py-0 text-[13px]" placeholder="…or paste an image URL"
          value={value?.startsWith('data:') ? '' : value || ''} onChange={(e) => onChange(e.target.value)}
        />
        {err && <span className="text-xs font-medium text-red-600">{err}</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  )
}

export function YouTubeInput({ value, onChange }) {
  const thumb = youtubeThumb(value)
  return (
    <div className="flex items-center gap-3">
      <input className="field" placeholder="https://www.youtube.com/watch?v=…" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      {thumb && <img src={thumb} alt="" className="h-14 w-24 shrink-0 rounded-lg object-cover" />}
    </div>
  )
}

// Editable list of short strings (phone numbers, ticket inclusions…)
export function ListInput({ value = [], onChange, placeholder }) {
  const list = Array.isArray(value) ? value : []
  const update = (i, v) => onChange(list.map((x, j) => (j === i ? v : x)))
  return (
    <div className="grid gap-2">
      {list.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input className="field" value={item} placeholder={placeholder} onChange={(e) => update(i, e.target.value)} />
          <button type="button" aria-label="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))} className="ad-icon-btn h-auto w-9 shrink-0 hover:text-red-600">
            <Trash2 size={17} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...list, ''])} className="ad-btn-ghost h-8 w-fit"><Plus size={15} /> Add</button>
    </div>
  )
}

// Renders one input from a schema entry: { key, label, type, options, hint }
export function SchemaInput({ f, value, onChange }) {
  switch (f.type) {
    case 'textarea':
      return <textarea className="field min-h-24" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
    case 'number':
      return <input className="field" type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
    case 'select':
      return (
        <select className="field" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      )
    case 'checkbox':
      return (
        <span className="flex items-center gap-2 py-2">
          <input type="checkbox" className="h-5 w-5 accent-navy" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm text-slate-600">{f.checkboxText || 'Yes'}</span>
        </span>
      )
    case 'image':
      return <ImageInput value={value} onChange={onChange} />
    case 'youtube':
      return <YouTubeInput value={value} onChange={onChange} />
    case 'list':
      return <ListInput value={value} onChange={onChange} placeholder={f.placeholder} />
    default:
      return <input className="field" value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
  }
}
