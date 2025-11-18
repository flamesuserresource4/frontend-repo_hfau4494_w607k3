import { useEffect, useMemo, useRef, useState } from 'react'
import { X, Folder, TerminalSquare, Play, Link2 } from 'lucide-react'

export default function DevPanel({ open, onClose, backendUrl }) {
  const [tab, setTab] = useState('files')
  const [conn, setConn] = useState(null)
  const [testResult, setTestResult] = useState(null)

  // Files state
  const [path, setPath] = useState('.')
  const [items, setItems] = useState([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  // Terminal state
  const [command, setCommand] = useState('echo Hello from Flames')
  const [logs, setLogs] = useState([])
  const [running, setRunning] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const saved = localStorage.getItem('private_server')
    if (saved) {
      const cfg = JSON.parse(saved)
      setConn(cfg)
    }
  }, [open])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const enabled = !!conn?.enabled

  const buildPayload = () => {
    if (!conn) return null
    const protocol = conn.protocol || 'HTTP'
    const base_url = conn.base_url || null
    return {
      enabled: !!conn.enabled,
      name: conn.name || null,
      host: conn.host || null,
      port: conn.port || null,
      username: conn.username || null,
      token: conn.token || null,
      protocol,
      base_url,
    }
  }

  const testConnection = async () => {
    try {
      setTestResult({ status: 'working' })
      const payload = { ...buildPayload(), path: '/', timeout_seconds: 5 }
      const r = await fetch(`${backendUrl}/api/private-server/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      setTestResult({ status: data.ok ? 'ok' : 'error', data })
    } catch (e) {
      setTestResult({ status: 'error', data: { message: e.message } })
    }
  }

  const listFiles = async () => {
    if (!enabled) return
    try {
      setLoadingFiles(true)
      const payload = { connection: buildPayload(), path, depth: 1 }
      const r = await fetch(`${backendUrl}/api/private-server/files/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      setItems(data.items || [])
    } catch (e) {
      setItems([])
    } finally {
      setLoadingFiles(false)
    }
  }

  const runCommand = async () => {
    if (!enabled || !command.trim()) return
    setLogs([])
    setRunning(true)
    try {
      const payload = { connection: buildPayload(), command }
      const resp = await fetch(`${backendUrl}/api/private-server/exec/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!resp.ok) throw new Error('Failed to start stream')
      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const parts = chunk.split('\n\n').filter(Boolean)
        for (const p of parts) {
          if (!p.startsWith('data: ')) continue
          try {
            const data = JSON.parse(p.slice(6))
            setLogs((prev) => [...prev, data])
            if (data.type === 'done') {
              setRunning(false)
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      setLogs((prev) => [...prev, { type: 'error', message: e.message }])
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full sm:w-[720px] bg-slate-950 text-blue-50 border-l border-white/10 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="text-lg font-semibold inline-flex items-center gap-2">
            <TerminalSquare size={18} /> Developer
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5"><X size={18} /></button>
        </div>

        <div className="px-4 py-2 border-b border-white/10 flex items-center gap-2">
          <button onClick={() => setTab('files')} className={`px-3 py-1.5 text-sm rounded ${tab==='files' ? 'bg-white/10 text-white' : 'text-blue-200/80 hover:bg-white/5'}`}><Folder size={14} className="inline mr-1"/>Files</button>
          <button onClick={() => setTab('terminal')} className={`px-3 py-1.5 text-sm rounded ${tab==='terminal' ? 'bg-white/10 text-white' : 'text-blue-200/80 hover:bg-white/5'}`}><TerminalSquare size={14} className="inline mr-1"/>Terminal</button>
          <div className="ml-auto text-xs text-blue-200/70 inline-flex items-center gap-2">
            <Link2 size={14} /> {enabled ? 'Connected (configured)' : 'Disabled'}
            {enabled && (
              <button onClick={testConnection} className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs">Test</button>
            )}
          </div>
        </div>

        {tab === 'files' && (
          <div className="p-4 space-y-3">
            <div className="text-sm text-blue-200/80">Browse files on your private dev server.</div>
            <div className="flex items-center gap-2">
              <input value={path} onChange={(e)=>setPath(e.target.value)} placeholder="Path (e.g., ., app, src)" className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
              <button disabled={!enabled} onClick={listFiles} className="px-3 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white text-sm">List</button>
            </div>
            <div className="border border-white/10 rounded p-2 h-[60vh] overflow-auto bg-slate-900/40">
              {loadingFiles && <div className="text-xs text-blue-200/70">Loading…</div>}
              {!loadingFiles && (items?.length ? (
                <ul className="text-sm">
                  {items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between py-1 border-b border-white/5 last:border-none">
                      <span className="truncate">{it.name}</span>
                      <span className="text-xs text-blue-200/60">{it.type}{it.size?` · ${it.size}b`:''}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-blue-200/60">No items</div>
              ))}
            </div>
          </div>
        )}

        {tab === 'terminal' && (
          <div className="p-4 space-y-3">
            <div className="text-sm text-blue-200/80">Run a command on your private dev server (streamed output).</div>
            <div className="flex items-center gap-2">
              <input value={command} onChange={(e)=>setCommand(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
              <button disabled={!enabled || running} onClick={runCommand} className={`px-3 py-2 rounded text-white text-sm inline-flex items-center gap-2 ${running? 'bg-blue-500/50':'bg-blue-500 hover:bg-blue-600'}`}>
                <Play size={16}/> Run
              </button>
            </div>
            <div className="border border-white/10 rounded p-2 h-[60vh] overflow-auto bg-black/50 text-green-200 font-mono text-xs">
              {logs.map((l, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {l.type === 'start' && `> ${l.command}`}
                  {l.type === 'log' && l.line}
                  {l.type === 'output' && l.data}
                  {l.type === 'error' && `error: ${l.message}`}
                  {l.type === 'done' && '[done]'}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>
        )}

        {testResult && (
          <div className={`m-3 p-2 rounded border ${testResult.status==='ok' ? 'border-emerald-400/30 bg-emerald-900/20' : testResult.status==='working' ? 'border-blue-400/30 bg-blue-900/20' : 'border-rose-400/30 bg-rose-900/20'}`}>
            <div className="text-xs text-blue-100">{testResult.status==='working' ? 'Testing connection…' : (testResult.status==='ok' ? 'Connection OK' : 'Connection failed')}</div>
          </div>
        )}
      </div>
    </div>
  )
}
