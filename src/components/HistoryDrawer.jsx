import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

export default function HistoryDrawer({ open, onClose, backendUrl }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    const load = async () => {
      setLoading(true)
      try {
        const r = await fetch(`${backendUrl}/api/conversations`)
        const data = await r.json()
        setItems(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, backendUrl])

  return (
    <div className={`fixed inset-0 z-30 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute left-0 top-0 h-full w-full sm:w-[420px] bg-slate-950 text-blue-50 border-r border-white/10 transform transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <Clock size={18} />
          <div className="text-sm font-semibold">Conversation History</div>
        </div>
        <div className="p-3 overflow-y-auto h-[calc(100%-48px)]">
          {loading ? (
            <div className="text-center text-blue-200/70 text-sm">Loading…</div>
          ) : items.length === 0 ? (
            <div className="text-center text-blue-200/70 text-sm">No conversations yet</div>
          ) : (
            <div className="space-y-2">
              {items.map((c) => (
                <div key={c.id} className="p-3 rounded-md bg-white/5 border border-white/10">
                  <div className="text-sm font-medium text-white truncate">{c.title || 'Untitled'}</div>
                  <div className="text-xs text-blue-200/70">{c.mode} • {c.provider} • {new Date(c.updated_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
