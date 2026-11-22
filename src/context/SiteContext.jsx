import { createContext, useContext, useEffect, useState } from 'react'
import { watchSettings, watchCollection } from '../lib/store'
import { defaultSettings } from '../data/defaults'

const SiteContext = createContext(null)

const PUBLIC_COLLECTIONS = ['rides', 'tickets', 'offers', 'gallery', 'faqs']

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings)
  const [data, setData] = useState({ rides: [], tickets: [], offers: [], gallery: [], faqs: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stops = [
      watchSettings((s) => { setSettings(s); setLoading(false) }),
      ...PUBLIC_COLLECTIONS.map((name) =>
        watchCollection(name, (items) => setData((prev) => ({ ...prev, [name]: items }))),
      ),
    ]
    return () => stops.forEach((stop) => stop && stop())
  }, [])

  useEffect(() => {
    document.title = `${settings.name} | ${settings.tagline}`
  }, [settings.name, settings.tagline])

  return (
    <SiteContext.Provider value={{ settings, ...data, loading }}>
      {children}
    </SiteContext.Provider>
  )
}

export const useSite = () => useContext(SiteContext)
