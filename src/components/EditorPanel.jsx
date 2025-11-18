import { useEffect, useMemo, useState } from 'react'
import { X, Save, FolderOpen, FileCode } from 'lucide-react'
import CodeMirror from '@uiw/react-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'

const guessLang = (name) => {
  if (!name) return javascript()
  if (name.endsWith('.py')) return python()
  if (name.endsWith('.js') || name.endsWith('.jsx') || name.endsWith('.ts') || name.endsWith('.tsx')) return javascript()
  return javascript()
}

export default function EditorPanel({ open, onClose, backendUrl }) {
  const [conn, setConn] = useState(null)
  const [path, setPath] = useState('app/main.py')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    if (!open) return
    const saved = localStorage.getItem('private_server')
    if (saved) setConn(JSON.parse(saved))
  }, [open])

  const loadFile = async () => {
    setStatus('loading')
    try {
      // Placeholder: Since private server file read API not implemented, show mocked content
      // In future: POST to /api/private-server/files/read
      const demo = '# Example Python file\n\nprint("Hello from Flames Editor")\n'
      setContent(demo)
      setStatus('ok')
    } catch (e) {
      setStatus('error')
    }
  }

  const saveFile = async () => {
    setStatus('saving')
    try {
      // Placeholder: In future, POST to /api/private-server/files/write
      await new Promise((r) => setTimeout(r, 500))
      setStatus('saved')
      setTimeout(()=>setStatus(null), 1200)
    } catch (e) {
      setStatus('error')
    }
  }

  useEffect(() => {
    if (open) loadFile()
  }, [open])

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full sm:w-[860px] bg-slate-950 text-blue-50 border-l border-white/10 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-3 border-b border-white/10">
          <div className="inline-flex items-center gap-2 text-lg font-semibold"><FileCode size={18}/> Editor</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5"><X size={18} /></button>
        </div>

        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input value={path} onChange={(e)=>setPath(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
            <button onClick={loadFile} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-xs inline-flex items-center gap-1"><FolderOpen size={14}/> Open</button>
            <button onClick={saveFile} className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs inline-flex items-center gap-1"><Save size={14}/> Save</button>
            {status && <span className="text-xs text-blue-200/70">{status}</span>}
          </div>

          <div className="border border-white/10 rounded overflow-hidden h-[75vh]">
            <CodeMirror
              value={content}
              height="100%"
              theme={oneDark}
              extensions={[guessLang(path)]}
              onChange={(v)=>setContent(v)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
