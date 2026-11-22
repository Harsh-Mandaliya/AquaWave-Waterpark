import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { PageHero } from './components/ui'

function ComingSoon() {
  return <PageHero eyebrow="Masti Water Park" title="Pages coming soon" text="Navigation, footer and contact buttons are ready." />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="*" element={<ComingSoon />} />
      </Route>
    </Routes>
  )
}
