import { Link } from 'react-router-dom'
import { PageHero } from '../components/ui'

export default function NotFound() {
  return (
    <>
      <PageHero title="Page not found" text="The page you were looking for has moved or no longer exists." />
      <div className="py-20 text-center"><Link to="/" className="btn-navy">Back to home</Link></div>
    </>
  )
}
