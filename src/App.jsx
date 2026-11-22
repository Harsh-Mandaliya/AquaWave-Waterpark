import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Rides from './pages/Rides'
import Tickets from './pages/Tickets'
import Offers from './pages/Offers'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Book from './pages/Book'
import NotFound from './pages/NotFound'
import AdminApp from './admin/AdminApp'
import Dashboard from './admin/Dashboard'
import SettingsPage from './admin/SettingsPage'
import Enquiries from './admin/Enquiries'
import Activity from './admin/Activity'
import Profile from './admin/Profile'
import { RidesAdmin, TicketsAdmin, OffersAdmin, GalleryAdmin, FaqsAdmin } from './admin/managers'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="rides" element={<Rides />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="offers" element={<Offers />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="contact" element={<Contact />} />
        <Route path="book" element={<Book />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="admin" element={<AdminApp />}>
        <Route index element={<Dashboard />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="rides" element={<RidesAdmin />} />
        <Route path="tickets" element={<TicketsAdmin />} />
        <Route path="offers" element={<OffersAdmin />} />
        <Route path="gallery" element={<GalleryAdmin />} />
        <Route path="faqs" element={<FaqsAdmin />} />
        <Route path="activity" element={<Activity />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
