import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'
import { friendlyError } from '../lib/store'

const ToastContext = createContext(() => {})

// Small notices in the bottom-right corner. Error text is always turned into plain language.
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const close = (id) => setToasts((t) => t.filter((x) => x.id !== id))
  const push = useCallback((text, kind = 'ok') => {
    const id = Math.random()
    const shown = kind === 'error' ? friendlyError(typeof text === 'string' ? { message: text } : text) : text
    setToasts((t) => [...t.slice(-2), { id, text: shown, kind }])
    setTimeout(() => close(id), 3500)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[90] grid w-[min(360px,calc(100vw-2rem))] gap-2">
        {toasts.map((t) => (
          <div key={t.id} role="status" className="reveal flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white p-3 pr-2 text-[13.5px] text-slate-800 shadow-lg">
            {t.kind === 'error'
              ? <AlertCircle size={17} className="mt-px shrink-0 text-red-600" />
              : <CheckCircle2 size={17} className="mt-px shrink-0 text-emerald-600" />}
            <span className="flex-1">{t.text}</span>
            <button onClick={() => close(t.id)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-700"><X size={15} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
