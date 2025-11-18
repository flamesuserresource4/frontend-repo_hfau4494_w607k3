import { useEffect, useState } from 'react'
import { Users, Plus, X, Play } from 'lucide-react'

const DEFAULT_AGENT = () => ({
  id: Math.random().toString(36).slice(2),
  name: 'Agent',
  provider: 'openrouter',
  model: 'openrouter/openai/gpt-4o',
  system: '',
  temperature: 0.7,
  parallel: true,
  active: true,
})

export default function MultiAgentPanel({ open, onClose, backendUrl, onRun }) {
  const [agents, setAgents] = useState([DEFAULT_AGENT(), { ...DEFAULT_AGENT(), name: 'Reviewer' }])
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState('parallel') // 'parallel' | 'sequential'

  useEffect(() => {
    if (!open) return
    try {
      const saved = localStorage.getItem('multi_agents')
      if (saved) setAgents(JSON.parse(saved))
    } catch {}
  }, [open])

  const save = () => {
    localStorage.setItem('multi_agents', JSON.stringify(agents))
    onClose()
  }

  const addAgent = () => setAgents((prev) => [...prev, DEFAULT_AGENT()])
  const removeAgent = (id) => setAgents((prev) => prev.filter((a) => a.id !== id))
  const update = (id, patch) => setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))

  const triggerRun = async () => {
    if (!onRun) return
    setRunning(true)
    try {
      await onRun({ mode, agents })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full sm:w-[720px] bg-slate-950 text-blue-50 border-l border-white/10 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="text-lg font-semibold inline-flex items-center gap-2"><Users size={18}/> Multi‑Agent</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5"><X size={18} /></button>
        </div>

        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
          <select value={mode} onChange={(e)=>setMode(e.target.value)} className="text-sm bg-white/5 border border-white/10 rounded px-2 py-1">
            <option value="parallel">Parallel</option>
            <option value="sequential">Sequential</option>
          </select>
          <div className="ml-auto inline-flex items-center gap-2">
            <button onClick={addAgent} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs inline-flex items-center gap-1"><Plus size={14}/> Add</button>
            <button disabled={running} onClick={triggerRun} className={`px-3 py-1.5 rounded text-white text-sm inline-flex items-center gap-2 ${running? 'bg-blue-500/50':'bg-blue-500 hover:bg-blue-600'}`}><Play size={16}/>Run</button>
            <button onClick={save} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs">Save</button>
          </div>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-100px)]">
          {agents.map((a) => (
            <div key={a.id} className="p-3 rounded border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <input value={a.name} onChange={(e)=>update(a.id,{name:e.target.value})} placeholder="Name" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm" />
                <input value={a.provider} onChange={(e)=>update(a.id,{provider:e.target.value})} placeholder="Provider" className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm" />
                <input value={a.model} onChange={(e)=>update(a.id,{model:e.target.value})} placeholder="Model" className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm" />
                <button onClick={()=>removeAgent(a.id)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs"><X size={14}/></button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <textarea value={a.system} onChange={(e)=>update(a.id,{system:e.target.value})} placeholder="System prompt" rows={2} className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm"></textarea>
                <div className="flex items-center gap-3 text-xs text-blue-200/80">
                  <label className="inline-flex items-center gap-1">
                    <input type="checkbox" checked={a.parallel} onChange={(e)=>update(a.id,{parallel:e.target.checked})} /> Parallel capable
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <span>Temperature</span>
                    <input type="number" step="0.1" min="0" max="2" value={a.temperature} onChange={(e)=>update(a.id,{temperature:parseFloat(e.target.value)})} className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1" />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
