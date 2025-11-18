import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function SettingsSheet({ open, onClose, onSaveProvider, onSavePrivateServer }) {
  const [provider, setProvider] = useState({ provider: 'openrouter', base_url: 'https://openrouter.ai/api/v1', api_key: '' })
  const [privateServer, setPrivateServer] = useState({ enabled: false, name: '', host: '', port: '', username: '', token: '', protocol: 'HTTP' })

  useEffect(() => {
    const savedProv = localStorage.getItem('provider_cfg')
    const savedPS = localStorage.getItem('private_server')
    if (savedProv) setProvider(JSON.parse(savedProv))
    if (savedPS) setPrivateServer(JSON.parse(savedPS))
  }, [open])

  const saveAll = () => {
    localStorage.setItem('provider_cfg', JSON.stringify(provider))
    localStorage.setItem('private_server', JSON.stringify(privateServer))
    onSaveProvider(provider)
    onSavePrivateServer(privateServer)
    onClose()
  }

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full sm:w-[520px] bg-slate-950 text-blue-50 border-l border-white/10 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="text-lg font-semibold">Settings</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-white/5"><X size={18} /></button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-56px)]">
          <section>
            <h3 className="text-sm font-semibold text-blue-200/80 mb-3">Provider</h3>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-xs text-blue-200/70">Provider</label>
              <select value={provider.provider} onChange={(e) => setProvider({ ...provider, provider: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm">
                <option value="openrouter">OpenRouter</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="grok">Grok</option>
                <option value="minimax">Minimax</option>
                <option value="custom">Custom (OpenAI-compatible)</option>
              </select>
              <label className="text-xs text-blue-200/70 mt-2">Base URL</label>
              <input value={provider.base_url} onChange={(e) => setProvider({ ...provider, base_url: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
              <label className="text-xs text-blue-200/70 mt-2">API Key</label>
              <input type="password" value={provider.api_key} onChange={(e) => setProvider({ ...provider, api_key: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-blue-200/80 mb-3">Private Server for Development</h3>
            <div className="grid grid-cols-1 gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={privateServer.enabled} onChange={(e) => setPrivateServer({ ...privateServer, enabled: e.target.checked })} />
                Enabled
              </label>
              <label className="text-xs text-blue-200/70">Connection name</label>
              <input value={privateServer.name} onChange={(e) => setPrivateServer({ ...privateServer, name: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-blue-200/70">Host / domain</label>
                  <input value={privateServer.host} onChange={(e) => setPrivateServer({ ...privateServer, host: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-blue-200/70">Port</label>
                  <input value={privateServer.port} onChange={(e) => setPrivateServer({ ...privateServer, port: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <label className="text-xs text-blue-200/70">Username / login name</label>
              <input value={privateServer.username} onChange={(e) => setPrivateServer({ ...privateServer, username: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
              <label className="text-xs text-blue-200/70">API Token / Key</label>
              <input value={privateServer.token} onChange={(e) => setPrivateServer({ ...privateServer, token: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm" />
              <label className="text-xs text-blue-200/70">Protocol / mode</label>
              <select value={privateServer.protocol} onChange={(e) => setPrivateServer({ ...privateServer, protocol: e.target.value })} className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm">
                <option>HTTP</option>
                <option>HTTPS</option>
                <option>SSE</option>
                <option>WebSocket</option>
              </select>
            </div>
          </section>

          <div className="pt-2">
            <button onClick={saveAll} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}
