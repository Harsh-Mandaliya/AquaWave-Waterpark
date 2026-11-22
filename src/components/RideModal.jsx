import { Link } from 'react-router-dom'
import { Ruler, Gauge } from 'lucide-react'
import { Modal, ThrillMeter } from './ui'
import { RideImage, RIDE_LABEL } from './RideCard'

export default function RideModal({ ride, onClose }) {
  return (
    <Modal open={!!ride} onClose={onClose}>
      {ride && (
        <>
          <RideImage ride={ride} className="aspect-[16/10] w-full" />
          <div className="p-7">
            <span className="eyebrow">{RIDE_LABEL[ride.category] || ride.category}</span>
            <h3 className="mt-2 text-3xl font-semibold text-navy">{ride.name}</h3>
            <p className="mt-3 leading-relaxed text-slate-600">{ride.description}</p>
            <div className="mt-6 grid grid-cols-2 divide-x divide-line rounded-xl border border-line">
              <div className="p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500"><Ruler size={13} /> Height</p>
                <p className="mt-1 font-display text-xl text-navy">{ride.minHeight || 'All heights'}</p>
              </div>
              <div className="p-4">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500"><Gauge size={13} /> Thrill</p>
                <div className="mt-2"><ThrillMeter level={Number(ride.thrill) || 1} /></div>
              </div>
            </div>
            <Link to="/book" className="btn-red mt-6 w-full">Book your visit</Link>
          </div>
        </>
      )}
    </Modal>
  )
}
