import { useEffect, useRef, useState } from 'react'
import { Bot, Settings, History, ChevronDown, Users2, FileCode2, Wrench } from 'lucide-react'
import Spline from '@splinetool/react-spline'

export default function Header({ mode, setMode, provider, model, onOpenSettings, onOpenHistory, onOpenMultiAgent, onOpenEditor, onOpenDev, providers, modelsByProvider, onProviderChange, onModelChange }) {
  const [showModels, setShowModels] = useState(false)
  const [showProviders, setShowProviders] = useState(false)
  const provRef = useRef(null)
  const modelRef = useRef(null)

  const modes = [
    { id: 'chat', label: 'Chat' },
    { id: 'dev', label: 'Software Development' },
    { id: 'devops', label: 'DevOps' },
    { id: 'testing', label: 'Testing/Engineering' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'multi_parallel', label: 'Multi-Agent (Parallel)' },
    { id: 'multi_sequential', label: 'Multi-Agent (Sequential)' },
  ]

  useEffect(() => {
    const close = (e) => {
      if (!provRef.current?.contains(e.target)) setShowProviders(false)
      if (!modelRef.current?.contains(e.target)) setShowModels(false)
    }
    const onEsc = (e) => { if (e.key === 'Escape') { setShowModels(false); setShowProviders(false) } }
    window.addEventListener('click', close)
    window.addEventListener('keydown', onEsc)
    return () => { window.removeEventListener('click', close); window.removeEventListener('keydown', onEsc) }
  }, [])

  const currentModels = modelsByProvider[provider] || []

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-slate-900" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <Bot className="text-white/90" size={22} />
            </div>
            <div>
              <div className="text-white font-semibold leading-tight">Flames Blue</div>
              <div className="text-xs text-blue-200/70">Multi-Provider LLM Workbench</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={provRef}>
              <button onClick={(e) => { e.stopPropagation(); setShowProviders(!showProviders) }} className="text-sm text-blue-100/90 hover:text-white border border-white/10 bg-white/5 px-3 py-1.5 rounded-md inline-flex items-center gap-2 max-w-[50vw]">
                <span className="hidden sm:block truncate">{provider.toUpperCase()}</span>
                <ChevronDown size={16} />
              </button>
              {showProviders && (
                <div className="absolute right-0 mt-2 min-w-[12rem] max-w-[calc(100vw-1rem)] bg-slate-900/90 backdrop-blur border border-white/10 rounded-md overflow-auto z-40">
                  {providers.map((p) => (
                    <button key={p} onClick={() => { onProviderChange(p); setShowProviders(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 break-words ${p === provider ? 'text-white' : 'text-blue-200/80'}`}>{p.toUpperCase()}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" ref={modelRef}>
              <button onClick={(e) => { e.stopPropagation(); setShowModels(!showModels) }} className="text-sm text-blue-100/90 hover:text-white border border-white/10 bg-white/5 px-3 py-1.5 rounded-md inline-flex items-center gap-2 max-w-[60vw] sm:max-w-[220px]">
                <span className="truncate">{model}</span>
                <ChevronDown size={16} />
              </button>
              {showModels && (
                <div className="absolute right-0 mt-2 max-h-72 overflow-auto w-[min(18rem,calc(100vw-1rem))] bg-slate-900/90 backdrop-blur border border-white/10 rounded-md z-40">
                  {currentModels.map((m) => (
                    <button key={m.id} title={m.display_name} onClick={() => { onModelChange(m.id); setShowModels(false) }} className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 break-words ${m.id === model ? 'text-white' : 'text-blue-200/80'}`}>
                      {m.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={onOpenHistory} className="ml-2 p-2 rounded-md bg-white/5 border border-white/10 text-blue-100 hover:text-white">
              <History size={18} />
            </button>
            <button onClick={onOpenMultiAgent} title="Multi-Agent" className="p-2 rounded-md bg-white/5 border border-white/10 text-blue-100 hover:text-white">
              <Users2 size={18} />
            </button>
            <button onClick={onOpenEditor} title="Editor" className="p-2 rounded-md bg-white/5 border border-white/10 text-blue-100 hover:text-white">
              <FileCode2 size={18} />
            </button>
            <button onClick={onOpenDev} title="Dev" className="p-2 rounded-md bg-white/5 border border-white/10 text-blue-100 hover:text-white">
              <Wrench size={18} />
            </button>
            <button onClick={onOpenSettings} className="p-2 rounded-md bg-white/5 border border-white/10 text-blue-100 hover:text-white">
              <Settings size={18} />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">Multi-Provider LLM Workbench</h1>
            <p className="text-blue-200/80 text-sm">Unified chat across providers with dev workflows, code editing, and multi‑agent modes.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
