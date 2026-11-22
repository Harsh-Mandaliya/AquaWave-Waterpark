import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Phone, MessageCircle } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useSite } from '../context/SiteContext'
import { telHref, whatsappHref } from '../lib/utils'

export default function Layout() {
  const { settings } = useSite()
  const { pathname } = useLocation()

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <Navbar />
      <main className="overflow-x-clip"><Outlet /></main>
      <Footer />

      {/* quick contact buttons, always within thumb reach on mobile */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3">
        {settings.whatsapp && (
          <a
            href={whatsappHref(settings.whatsapp, `Hi ${settings.name}, I want to know about tickets.`)}
            target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
            className="grid h-14 w-14 place-items-center rounded-full bg-[#25d366] text-white shadow-xl transition hover:scale-110"
          >
            <MessageCircle size={26} />
          </a>
        )}
        {settings.phones?.[0] && (
          <a href={telHref(settings.phones[0])} aria-label="Call the park"
            className="grid h-14 w-14 place-items-center rounded-full bg-masti-red text-white shadow-xl transition hover:scale-110">
            <Phone size={24} />
          </a>
        )}
      </div>
    </>
  )
}
