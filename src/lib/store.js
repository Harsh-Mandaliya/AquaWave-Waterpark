// One small data layer for the whole app.
// - Firebase keys in .env        -> Cloud Firestore + Firebase Auth (live, shared by everyone)
// - VITE_USE_EMULATORS=true      -> the same, but against the local Firebase emulators
// - no keys at all               -> localStorage "demo mode" so the site still opens offline
// Pages never talk to Firebase directly; they only use the functions exported here.

import {
  collection, doc, onSnapshot, addDoc, updateDoc,
  getDoc, getDocs, writeBatch, serverTimestamp, query, orderBy, limit,
} from 'firebase/firestore'
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, updatePassword,
  reauthenticateWithCredential, EmailAuthProvider,
} from 'firebase/auth'
import { db, auth, firebaseReady, usingEmulators } from './firebase'
import {
  defaultSettings, defaultRides, defaultTickets, defaultOffers, defaultGallery, defaultFaqs,
} from '../data/defaults'

export const mode = firebaseReady ? (usingEmulators ? 'emulator' : 'firebase') : 'demo'
const isDemo = mode === 'demo'
export const DEMO_LOGIN = { email: 'admin@masti.local', password: 'masti@123' }

const SEED = {
  rides: defaultRides,
  tickets: defaultTickets,
  offers: defaultOffers,
  gallery: defaultGallery,
  faqs: defaultFaqs,
}

// Names shown in the activity log
const LABEL = { rides: 'ride', tickets: 'ticket', offers: 'offer', gallery: 'gallery item', faqs: 'FAQ', enquiries: 'enquiry' }
const itemLabel = (d = {}) => d.name || d.title || d.q || d.caption || d.status || ''

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0)
const byNewest = (key) => (a, b) => (b[key] ?? 0) - (a[key] ?? 0)
const sortFor = (name) => (name === 'enquiries' ? byNewest('createdAt') : name === 'activity' ? byNewest('at') : byOrder)
const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
const millis = (v) => (v?.toMillis ? v.toMillis() : v)

/* ------------------------------------------------------------------ */
/* Local demo store                                                    */
/* ------------------------------------------------------------------ */

const LS_KEY = 'masti-db-v2'
const listeners = new Set()

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* corrupted or blocked storage: start fresh */ }
  return { settings: defaultSettings, ...structuredClone(SEED), enquiries: [], activity: [] }
}

let local = isDemo ? readLocal() : null

function commitLocal() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(local)) } catch { /* quota or private mode */ }
  listeners.forEach((fn) => fn())
}

if (isDemo && typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === LS_KEY) { local = readLocal(); listeners.forEach((fn) => fn()) }
  })
}

function localWatch(fn) {
  listeners.add(fn)
  fn()
  return () => listeners.delete(fn)
}

/* ------------------------------------------------------------------ */
/* Activity log: every admin change is recorded                        */
/* ------------------------------------------------------------------ */

function logLocal(action, what, detail = '') {
  local.activity = [{ id: newId(), action, what, detail, by: DEMO_LOGIN.email, at: Date.now() }, ...(local.activity || [])].slice(0, 300)
}

// Runs a database change and its activity-log entry as ONE atomic write:
// either both are saved or neither is, so the log can never miss a change.
async function writeWithLog(apply, action, what, detail = '') {
  const batch = writeBatch(db)
  apply(batch)
  const by = auth?.currentUser?.email
  if (by) {
    batch.set(doc(collection(db, 'activity')), { action, what, detail: String(detail).slice(0, 120), by, at: serverTimestamp() })
  }
  pendingSaves++
  try { await batch.commit() } finally { pendingSaves-- }
}

// Warn the admin if they close the tab while a save is still on its way to the database.
let pendingSaves = 0
if (!isDemo && typeof window !== 'undefined') {
  window.addEventListener('beforeunload', (e) => {
    if (pendingSaves > 0) { e.preventDefault(); e.returnValue = '' }
  })
}

export function watchActivity(cb, max = 100) {
  if (isDemo) return localWatch(() => cb((local.activity || []).slice(0, max)))
  return onSnapshot(
    query(collection(db, 'activity'), orderBy('at', 'desc'), limit(max)),
    (snap) => cb(snap.docs.map((d) => ({ ...d.data(), id: d.id, at: millis(d.data().at) }))),
    () => cb([]),
  )
}

/* ------------------------------------------------------------------ */
/* Site settings (single document: site/settings)                      */
/* ------------------------------------------------------------------ */

export function watchSettings(cb) {
  if (isDemo) return localWatch(() => cb({ ...defaultSettings, ...local.settings }))
  return onSnapshot(
    doc(db, 'site', 'settings'),
    (snap) => cb({ ...defaultSettings, ...(snap.exists() ? snap.data() : {}) }),
    () => cb(defaultSettings),
  )
}

export async function saveSettings(data, changed = '') {
  if (isDemo) { local.settings = { ...local.settings, ...data }; logLocal('updated', 'site settings', changed); commitLocal(); return }
  await writeWithLog((b) => b.set(doc(db, 'site', 'settings'), data, { merge: true }), 'updated', 'site settings', changed)
}

/* ------------------------------------------------------------------ */
/* Collections: rides, tickets, offers, gallery, faqs, enquiries       */
/* ------------------------------------------------------------------ */

export function watchCollection(name, cb, { fallback = true } = {}) {
  const sort = sortFor(name)
  if (isDemo) return localWatch(() => cb([...(local[name] || [])].sort(sort)))

  return onSnapshot(
    collection(db, name),
    (snap) => {
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: millis(d.data().createdAt) }))
      // An empty collection on a fresh project shows the default content on the public
      // site until the admin presses "Load starter content".
      cb(items.length || !fallback ? items.sort(sort) : [...(SEED[name] || [])])
    },
    (err) => {
      if (import.meta.env.DEV) console.warn(`Cannot read ${name}:`, err.code)
      cb(fallback ? [...(SEED[name] || [])] : [])
    },
  )
}

export async function addItem(name, data) {
  if (isDemo) {
    local[name] = [...(local[name] || []), { ...data, id: newId(), createdAt: Date.now() }]
    logLocal('added', LABEL[name] || name, itemLabel(data))
    commitLocal()
    return
  }
  await writeWithLog((b) => b.set(doc(collection(db, name)), { ...data, createdAt: serverTimestamp() }), 'added', LABEL[name] || name, itemLabel(data))
}

export async function updateItem(name, id, data, { log = true, label } = {}) {
  const { id: _drop, createdAt: _c, ...rest } = data
  const detail = label ?? itemLabel(data)
  if (isDemo) {
    local[name] = local[name].map((it) => (it.id === id ? { ...it, ...rest } : it))
    if (log) logLocal('updated', LABEL[name] || name, detail)
    commitLocal()
    return
  }
  if (!log) return updateDoc(doc(db, name, id), rest)
  await writeWithLog((b) => b.update(doc(db, name, id), rest), 'updated', LABEL[name] || name, detail)
}

export async function removeItem(name, id, label = '') {
  if (isDemo) {
    local[name] = local[name].filter((it) => it.id !== id)
    logLocal('deleted', LABEL[name] || name, label)
    commitLocal()
    return
  }
  await writeWithLog((b) => b.delete(doc(db, name, id)), 'deleted', LABEL[name] || name, label)
}

// Public: visitors submit booking / contact enquiries (validated again by firestore.rules).
export async function sendEnquiry(data) {
  if (isDemo) {
    local.enquiries = [...(local.enquiries || []), { ...data, status: 'new', id: newId(), createdAt: Date.now() }]
    commitLocal()
    return
  }
  await addDoc(collection(db, 'enquiries'), { ...data, status: 'new', createdAt: serverTimestamp() })
}

/* ------------------------------------------------------------------ */
/* Starter content + reset                                             */
/* ------------------------------------------------------------------ */

export async function isContentEmpty() {
  if (isDemo) return false
  const [settings, rides] = await Promise.all([
    getDoc(doc(db, 'site', 'settings')),
    getDocs(collection(db, 'rides')),
  ])
  return !settings.exists() && rides.empty
}

export async function loadStarterContent() {
  if (isDemo) {
    local = { ...local, settings: defaultSettings, ...structuredClone(SEED) }
    logLocal('restored', 'starter content')
    commitLocal()
    return
  }
  {
    // remove anything the admin added, then write the defaults
    const batch = writeBatch(db)
    for (const name of Object.keys(SEED)) {
      const existing = await getDocs(collection(db, name))
      existing.forEach((d) => batch.delete(d.ref))
    }
    batch.set(doc(db, 'site', 'settings'), defaultSettings)
    for (const [name, items] of Object.entries(SEED)) {
      for (const { id, ...item } of items) batch.set(doc(db, name, id), item)
    }
    const by = auth?.currentUser?.email
    if (by) batch.set(doc(collection(db, 'activity')), { action: 'restored', what: 'starter content', detail: '', by, at: serverTimestamp() })
    await batch.commit()
  }
}

/* ------------------------------------------------------------------ */
/* Admin auth                                                          */
/* ------------------------------------------------------------------ */

const DEMO_SESSION = 'masti-admin-session'
const authListeners = new Set()

function demoUser() {
  let signedIn = false
  try { signedIn = sessionStorage.getItem(DEMO_SESSION) === '1' } catch { /* blocked */ }
  return signedIn ? { email: DEMO_LOGIN.email, isAdmin: true } : null
}

export function watchAdmin(cb) {
  if (isDemo) {
    const fn = () => cb(demoUser())
    authListeners.add(fn)
    fn()
    return () => authListeners.delete(fn)
  }
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return cb(null)
    let isAdmin = false
    try { isAdmin = (await getDoc(doc(db, 'admins', user.uid))).exists() } catch { /* rules deny */ }
    cb({ email: user.email, uid: user.uid, isAdmin })
  })
}

export async function adminLogin(email, password) {
  if (isDemo) {
    if (email.trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) {
      throw new Error('Wrong email or password.')
    }
    try { sessionStorage.setItem(DEMO_SESSION, '1') } catch { /* blocked */ }
    authListeners.forEach((fn) => fn())
    return
  }
  try {
    await signInWithEmailAndPassword(auth, email.trim(), password)
  } catch (err) {
    const code = err?.code || ''
    if (code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found') || code.includes('invalid-email')) {
      throw new Error('Wrong email or password.')
    }
    if (code.includes('too-many-requests')) throw new Error('Too many attempts. Try again in a few minutes.')
    throw new Error('Could not sign in. Check your internet connection.')
  }
}

export async function adminLogout() {
  if (isDemo) {
    try { sessionStorage.removeItem(DEMO_SESSION) } catch { /* blocked */ }
    authListeners.forEach((fn) => fn())
    return
  }
  await signOut(auth)
}

/* ------------------------------------------------------------------ */
/* Admin profile (stored in admins/{uid}: name, phone, photo)          */
/* ------------------------------------------------------------------ */

export function watchProfile(user, cb) {
  if (!user) return () => {}
  if (isDemo) return localWatch(() => cb({ email: user.email, role: 'owner', ...(local.profile || {}) }))
  return onSnapshot(
    doc(db, 'admins', user.uid),
    (snap) => cb({ email: user.email, ...(snap.exists() ? snap.data() : {}) }),
    () => cb({ email: user.email }),
  )
}

export async function saveProfile({ name = '', phone = '', photo = '' }) {
  const data = { name: name.trim().slice(0, 60), phone: phone.trim().slice(0, 20), photo }
  if (isDemo) {
    local.profile = { ...(local.profile || {}), ...data }
    logLocal('updated', 'profile', data.name)
    commitLocal()
    return
  }
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in again.')
  await writeWithLog((b) => b.update(doc(db, 'admins', user.uid), { ...data, updatedAt: serverTimestamp() }), 'updated', 'profile', data.name)
  if (data.name !== (user.displayName || '')) await updateProfile(user, { displayName: data.name }).catch(() => {})
}

export async function changePassword(current, next) {
  if (isDemo) throw new Error('Password cannot be changed in preview mode.')
  const user = auth.currentUser
  if (!user) throw new Error('Please sign in again.')
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current))
  } catch {
    throw new Error('Your current password is not correct.')
  }
  try {
    await updatePassword(user, next)
  } catch (err) {
    if ((err?.code || '').includes('weak-password')) throw new Error('Please choose a stronger password.')
    throw new Error('Could not change the password. Please try again.')
  }
  await addDoc(collection(db, 'activity'), { action: 'updated', what: 'password', detail: '', by: user.email, at: serverTimestamp() }).catch(() => {})
}

// Turns technical errors into plain sentences for the admin screens.
export function friendlyError(err) {
  const msg = `${err?.code || ''} ${err?.message || ''}`.toLowerCase()
  if (msg.includes('permission') || msg.includes('insufficient')) return 'You do not have permission to do that.'
  if (msg.includes('unavailable') || msg.includes('network') || msg.includes('offline')) return 'Could not connect. Check your internet and try again.'
  if (msg.includes('too large') || msg.includes('exceeds')) return 'That file is too large. Please use a smaller image.'
  return err?.message && !/firebase|firestore|grpc|rpc/i.test(err.message) ? err.message : 'Something went wrong. Please try again.'
}
