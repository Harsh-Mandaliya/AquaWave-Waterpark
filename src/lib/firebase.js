import { initializeApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

const env = import.meta.env

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

// true  -> talk to the local Firebase emulators (npm run backend)
// false -> talk to the real Firebase project from .env
export const usingEmulators = env.VITE_USE_EMULATORS === 'true'

// With no keys at all we fall back to a browser-only demo store (see store.js).
export const firebaseReady = Boolean(config.apiKey && config.projectId)

export const app = firebaseReady ? initializeApp(config) : null
export const db = firebaseReady ? getFirestore(app) : null
export const auth = firebaseReady ? getAuth(app) : null

if (firebaseReady && usingEmulators) {
  const host = env.VITE_EMULATOR_HOST || '127.0.0.1'
  connectFirestoreEmulator(db, host, 8080)
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true })
}
