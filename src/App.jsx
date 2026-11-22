import { useSite } from './context/SiteContext'

export default function App() {
  const { settings } = useSite()
  return (
    <main className="grid min-h-screen place-items-center bg-navy p-6 text-center text-white">
      <div>
        <img src={settings.logo} alt={settings.name} className="mx-auto h-28 w-auto" />
        <h1 className="mt-6 text-4xl">{settings.name}</h1>
        <p className="mt-2 text-white/70">{settings.tagline}</p>
        <p className="mt-6 text-sm text-white/60">{settings.address}</p>
      </div>
    </main>
  )
}
