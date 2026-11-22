// Sets up the LOCAL backend the first time:
//   1. creates the admin login in the Auth emulator
//   2. marks that user as admin (admins/{uid})
//   3. loads the starter rides, tickets, offers, gallery, FAQs and settings
// Run while "npm run backend" is running:   npm run seed
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, writeBatch, doc, getDocs, collection } from 'firebase/firestore'
import {
  defaultSettings, defaultRides, defaultTickets, defaultOffers, defaultGallery, defaultFaqs,
} from '../src/data/defaults.js'

const PROJECT = 'demo-masti'
const HOST = '127.0.0.1'
// Local test login only (the emulator never leaves this computer). Change it with env vars if you like.
const EMAIL = process.env.ADMIN_EMAIL || 'admin@masti.test'
const PASSWORD = process.env.ADMIN_PASSWORD || 'Masti@2026'

async function ensureUser() {
  const base = `http://${HOST}:9099/identitytoolkit.googleapis.com/v1`
  const body = JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true })
  const headers = { 'Content-Type': 'application/json' }
  let res = await fetch(`${base}/accounts:signUp?key=local`, { method: 'POST', headers, body })
  if (!res.ok) res = await fetch(`${base}/accounts:signInWithPassword?key=local`, { method: 'POST', headers, body })
  if (!res.ok) throw new Error(`Auth emulator: ${await res.text()}`)
  return (await res.json()).localId
}

async function makeAdmin(uid) {
  // "Bearer owner" bypasses security rules — only works on the emulator.
  const url = `http://${HOST}:8080/v1/projects/${PROJECT}/databases/(default)/documents/admins/${uid}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: { email: { stringValue: EMAIL }, role: { stringValue: 'owner' } } }),
  })
  if (!res.ok) throw new Error(`Firestore emulator: ${await res.text()}`)
}

try {
  const uid = await ensureUser()
  await makeAdmin(uid)
  console.log(`✓ admin user ready: ${EMAIL}`)

  // load content as the admin, so the security rules are exercised too
  const app = initializeApp({ apiKey: 'demo-local-key', projectId: PROJECT })
  const auth = getAuth(app)
  connectAuthEmulator(auth, `http://${HOST}:9099`, { disableWarnings: true })
  const db = getFirestore(app)
  connectFirestoreEmulator(db, HOST, 8080)
  await signInWithEmailAndPassword(auth, EMAIL, PASSWORD)

  const rides = await getDocs(collection(db, 'rides'))
  if (!rides.empty && !process.argv.includes('--force')) {
    console.log('✓ content already loaded (use "npm run seed -- --force" to reset it)')
  } else {
    const batch = writeBatch(db)
    batch.set(doc(db, 'site', 'settings'), defaultSettings)
    const seed = { rides: defaultRides, tickets: defaultTickets, offers: defaultOffers, gallery: defaultGallery, faqs: defaultFaqs }
    for (const [name, items] of Object.entries(seed)) for (const { id, ...item } of items) batch.set(doc(db, name, id), item)
    await batch.commit()
    console.log('✓ starter content loaded')
  }
  console.log('\nAdmin panel: http://localhost:5173/admin   (npm run dev:local)')
  console.log('Database viewer: http://127.0.0.1:4000/firestore')
  process.exit(0)
} catch (err) {
  console.error('\n✗ Seeding failed. Is "npm run backend" running?\n', err.message)
  process.exit(1)
}
