import { useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import Chat from './components/Chat'
import SettingsSheet from './components/SettingsSheet'
import HistoryDrawer from './components/HistoryDrawer'
import DevPanel from './components/DevPanel'

function App() {
  const backendUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])
  const [mode, setMode] = useState('chat')
  const [provider, setProvider] = useState('openrouter')
  const [modelsByProvider, setModelsByProvider] = useState({ openrouter: [] })
  const [model, setModel] = useState('openrouter/openai/gpt-4o')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [devOpen, setDevOpen] = useState(false)

  // Load saved provider config if any
  useEffect(() => {
    const savedProv = localStorage.getItem('provider_cfg')
    if (savedProv) {
      const cfg = JSON.parse(savedProv)
      if (cfg.provider) setProvider(cfg.provider)
    }
  }, [])

  // Fetch models for selected provider
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const body = { provider, base_url: 'placeholder', api_key: '' }
        const r = await fetch(`${backendUrl}/api/providers/models`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await r.json()
        setModelsByProvider((prev) => ({ ...prev, [provider]: data.models || [] }))
        if ((data.models || []).length && !data.models.find((m) => m.id === model)) {
          setModel(data.models[0].id)
        }
      } catch (e) {
        // ignore for now
      }
    }
    fetchModels()
  }, [provider, backendUrl])

  const providers = ['openrouter', 'openai', 'gemini', 'claude', 'grok', 'minimax', 'custom']

  return (
    <div className="min-h-screen bg-slate-900 text-blue-50">
      <Header
        mode={mode}
        setMode={setMode}
        provider={provider}
        model={model}
        providers={providers}
        modelsByProvider={modelsByProvider}
        onProviderChange={(p) => setProvider(p)}
        onModelChange={(m) => setModel(m)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
      />

      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Chat backendUrl={backendUrl} provider={provider} model={model} />
        </div>
      </div>

      {/* Dev panel toggle for private server flows */}
      <button
        onClick={() => setDevOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg px-4 py-2 text-sm"
      >
        Dev
      </button>

      <DevPanel open={devOpen} onClose={() => setDevOpen(false)} backendUrl={backendUrl} />

      <SettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaveProvider={(cfg) => setProvider(cfg.provider)}
        onSavePrivateServer={() => {}}
      />

      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} backendUrl={backendUrl} />
    </div>
  )
}

export default App
