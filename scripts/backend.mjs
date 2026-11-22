// Starts the local Firebase backend (Firestore database + Authentication) with the real security rules.
// Data is saved to ./emulator-data when you stop it with Ctrl+C and loaded again next time.
//   npm run backend      -> then open http://127.0.0.1:4000 to browse the database
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'emulator-data')
const args = ['emulators:start', '--project', 'demo-masti', '--export-on-exit', dataDir]
if (existsSync(path.join(dataDir, 'firebase-export-metadata.json'))) args.push('--import', dataDir)

const bin = path.join(root, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js')
const child = spawn(process.execPath, [bin, ...args], { cwd: root, stdio: 'inherit' })
child.on('exit', (code) => process.exit(code ?? 0))
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig))
