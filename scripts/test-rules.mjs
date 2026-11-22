// Checks the database security rules against the running local backend.
//   npm run backend   (in one terminal)
//   npm run test:rules
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import {
  getFirestore, connectFirestoreEmulator, collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  serverTimestamp, Timestamp, setLogLevel,
} from 'firebase/firestore'

const HOST = '127.0.0.1'
setLogLevel('silent')
const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@masti.test', password: process.env.ADMIN_PASSWORD || 'Masti@2026' }

let appCount = 0
async function client(login) {
  const app = initializeApp({ apiKey: 'demo-local-key', projectId: 'demo-masti' }, `t${appCount++}`)
  const auth = getAuth(app)
  connectAuthEmulator(auth, `http://${HOST}:9099`, { disableWarnings: true })
  const db = getFirestore(app)
  connectFirestoreEmulator(db, HOST, 8080)
  if (login === 'admin') await signInWithEmailAndPassword(auth, ADMIN.email, ADMIN.password)
  if (login === 'stranger') {
    const email = `stranger${Date.now()}@test.local`
    await createUserWithEmailAndPassword(auth, email, 'not-an-admin-123')
  }
  return { app, db, auth }
}

const iso = (offsetDays) => {
  const d = new Date(); d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const booking = (patch = {}) => ({
  type: 'booking', name: 'Rules Test', phone: '9876543210', email: '', message: '', channel: 'whatsapp',
  date: iso(3), adults: 2, kids: 1, ticket: 'Adult', groupType: 'family', estimate: 1700,
  status: 'new', createdAt: serverTimestamp(), ...patch,
})

let pass = 0, fail = 0
async function expect(label, shouldWork, fn) {
  let worked = true, msg = ''
  try { await fn() } catch (e) { worked = false; msg = e.code || e.message }
  const ok = worked === shouldWork
  ok ? pass++ : fail++
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} - ${label}${ok ? '' : `  (expected ${shouldWork ? 'allowed' : 'denied'}, got ${worked ? 'allowed' : msg})`}`)
}

try {
  const visitor = await client()
  const stranger = await client('stranger')
  const admin = await client('admin')
  const E = (db) => collection(db, 'enquiries')

  console.log('\nVisitor (not logged in)')
  await expect('can read site settings', true, () => getDoc(doc(visitor.db, 'site', 'settings')))
  await expect('can read rides', true, () => getDocs(collection(visitor.db, 'rides')))
  await expect('can send a valid booking', true, () => addDoc(E(visitor.db), booking()))
  await expect('can book for today', true, () => addDoc(E(visitor.db), booking({ date: iso(0) })))
  await expect('can send a contact message', true, () => addDoc(E(visitor.db), { type: 'contact', name: 'Rules Test', phone: '9876543210', email: '', message: 'Is the park open on Monday?', channel: 'whatsapp', status: 'new', createdAt: serverTimestamp() }))
  await expect('cannot book a past date', false, () => addDoc(E(visitor.db), booking({ date: iso(-2) })))
  await expect('cannot book more than a year ahead', false, () => addDoc(E(visitor.db), booking({ date: iso(400) })))
  await expect('cannot send negative adults', false, () => addDoc(E(visitor.db), booking({ adults: -1 })))
  await expect('cannot send negative kids', false, () => addDoc(E(visitor.db), booking({ kids: -2 })))
  await expect('cannot send decimal guests', false, () => addDoc(E(visitor.db), booking({ adults: 1.5 })))
  await expect('cannot send zero adults', false, () => addDoc(E(visitor.db), booking({ adults: 0, kids: 3 })))
  await expect('cannot send more than 200 guests', false, () => addDoc(E(visitor.db), booking({ adults: 150, kids: 60 })))
  await expect('cannot send unknown visit type', false, () => addDoc(E(visitor.db), booking({ groupType: 'party' })))
  await expect('cannot send a bad phone number', false, () => addDoc(E(visitor.db), booking({ phone: '12345' })))
  await expect('cannot skip the ticket', false, () => addDoc(E(visitor.db), booking({ ticket: '' })))
  await expect('cannot add extra fields', false, () => addDoc(E(visitor.db), booking({ isPaid: true })))
  await expect('cannot pre-mark as confirmed', false, () => addDoc(E(visitor.db), booking({ status: 'confirmed' })))
  await expect('cannot fake the time', false, () => addDoc(E(visitor.db), booking({ createdAt: Timestamp.fromDate(new Date('2020-01-01')) })))
  await expect('cannot read enquiries', false, () => getDocs(E(visitor.db)))
  await expect('cannot change site settings', false, () => setDoc(doc(visitor.db, 'site', 'settings'), { name: 'Hacked' }, { merge: true }))
  await expect('cannot add a ride', false, () => addDoc(collection(visitor.db, 'rides'), { name: 'Fake' }))
  await expect('cannot read the activity log', false, () => getDocs(collection(visitor.db, 'activity')))
  await expect('cannot make themselves admin', false, () => setDoc(doc(visitor.db, 'admins', 'me'), { role: 'owner' }))

  console.log('\nLogged-in user who is NOT an admin')
  await expect('cannot read enquiries', false, () => getDocs(E(stranger.db)))
  await expect('cannot change settings', false, () => setDoc(doc(stranger.db, 'site', 'settings'), { name: 'Hacked' }, { merge: true }))
  await expect('cannot add themselves to admins', false, () => setDoc(doc(stranger.db, 'admins', stranger.auth.currentUser.uid), { role: 'owner' }))

  console.log('\nAdmin')
  // work only on an enquiry created by this test, never on real ones
  const first = doc(admin.db, 'enquiries', (await addDoc(E(visitor.db), booking())).id)
  await expect('can read enquiries', true, async () => { if ((await getDocs(E(admin.db))).empty) throw new Error('none found') })
  await expect('can change enquiry status', true, () => updateDoc(first, { status: 'contacted' }))
  await expect('cannot set an unknown status', false, () => updateDoc(first, { status: 'paid' }))
  await expect('cannot edit what the visitor sent', false, () => updateDoc(first, { adults: 50 }))
  await expect('can update site settings', true, () => setDoc(doc(admin.db, 'site', 'settings'), { announcement: 'Open all week · 10:00 AM to 6:00 PM · Group & school bookings welcome' }, { merge: true }))
  await expect('can add & delete a ride', true, async () => { const r = await addDoc(collection(admin.db, 'rides'), { name: 'Temp' }); await deleteDoc(r) })
  const log = await addDoc(collection(admin.db, 'activity'), { action: 'updated', what: 'rules test', detail: '', by: ADMIN.email, at: serverTimestamp() })
  await expect('can write the activity log as themselves', true, async () => {})
  await expect('cannot write the log as someone else', false, () => addDoc(collection(admin.db, 'activity'), { action: 'updated', what: 'x', by: 'someone@else.com', at: serverTimestamp() }))
  await expect('cannot delete log history', false, () => deleteDoc(log))
  await expect('can delete an enquiry', true, () => deleteDoc(first))

  console.log('\nAdmin profile')
  const me = doc(admin.db, 'admins', admin.auth.currentUser.uid)
  const before = (await getDoc(me)).data()
  await expect('can update own name, phone and photo', true, () => updateDoc(me, { name: 'Rules Test Owner', phone: '9876543210', photo: '', updatedAt: serverTimestamp() }))
  await expect('cannot change own role', false, () => updateDoc(me, { role: 'superadmin' }))
  await expect('cannot store a huge photo', false, () => updateDoc(me, { photo: 'x'.repeat(310000), updatedAt: serverTimestamp() }))
  await expect('visitor cannot edit an admin profile', false, () => updateDoc(doc(visitor.db, 'admins', admin.auth.currentUser.uid), { name: 'Hacked' }))
  await expect('other user cannot edit an admin profile', false, () => updateDoc(doc(stranger.db, 'admins', admin.auth.currentUser.uid), { name: 'Hacked' }))
  await updateDoc(me, { name: before.name ?? '', phone: before.phone ?? '', photo: before.photo ?? '', updatedAt: serverTimestamp() })

  // clean up: remove the test enquiries and test log entries this script created
  for (const d of (await getDocs(E(admin.db))).docs) if (d.data().name === 'Rules Test') await deleteDoc(d.ref).catch(() => {})
  await fetch(`http://${HOST}:8080/v1/projects/demo-masti/databases/(default)/documents/activity/${log.id}`, { method: 'DELETE', headers: { Authorization: 'Bearer owner' } })

  for (const c of [visitor, stranger, admin]) await deleteApp(c.app)
  console.log(`\n${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
} catch (err) {
  console.error('\n✗ Could not run. Is "npm run backend" running and "npm run seed" done?\n', err.message)
  process.exit(1)
}
