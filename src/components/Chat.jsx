import { useEffect, useRef, useState } from 'react'
import { Mic, Paperclip, Send, Loader2 } from 'lucide-react'

export default function Chat({ backendUrl, provider, model }) {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [attachments, setAttachments] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [thinking, setThinking] = useState(false)
  const endRef = useRef(null)

  // auto-grow textarea rows up to a cap
  const [rows, setRows] = useState(1)
  useEffect(() => {
    const lines = input.split('\n').length
    setRows(Math.min(8, Math.max(1, lines)))
  }, [input])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const onAttach = (e) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const onSend = async () => {
    if (!input.trim() && attachments.length === 0) return

    const userMsg = { role: 'user', content: input, attachments: attachments.map(f => ({ name: f.name, size: f.size })) }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setAttachments([])

    try {
      setStreaming(true)
      setThinking(true)
      const resp = await fetch(`${backendUrl}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model, messages: [...messages, userMsg] }),
      })

      if (!resp.ok) throw new Error('Stream failed')

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let assistant = { role: 'assistant', content: '' }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n').filter(Boolean)
        for (const l of lines) {
          if (l.startsWith('data: ')) {
            const data = JSON.parse(l.slice(6))
            if (data.type === 'chunk') {
              assistant.content += data.text
              setMessages((prev) => {
                const copy = [...prev]
                if (copy[copy.length - 1]?.role === 'assistant') copy.pop()
                return [...copy, { ...assistant }]
              })
            } else if (data.type === 'done') {
              setThinking(false)
            }
          }
        }
      }
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Error: ' + e.message }])
      setThinking(false)
    } finally {
      setStreaming(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-0 sm:px-2 lg:px-4 py-4 space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`max-w-3xl ${m.role === 'user' ? 'ml-auto' : ''}`}>
            <div className={`rounded-2xl border ${m.role === 'user' ? 'bg-blue-500 text-white border-blue-400' : 'bg-white/5 text-blue-100 border-white/10'} p-4` }>
              <div className="whitespace-pre-wrap text-sm leading-6">{m.content}</div>
              {m.attachments?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {m.attachments.map((a, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded bg-black/20 border border-white/10">{a.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-blue-200/80 text-xs">
              <Loader2 className="animate-spin" size={14} /> Thinking…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-white/10 bg-slate-900/60 backdrop-blur px-2 sm:px-4 lg:px-6 py-3">
        <div className="mx-auto max-w-3xl lg:max-w-4xl">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((f, i) => (
                <div key={i} className="text-xs px-2 py-1 rounded bg-white/5 border border-white/10 text-blue-200/80">
                  {f.name}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <label className="p-2 rounded-md bg-white/5 border border-white/10 text-blue-100 hover:text-white cursor-pointer">
              <Paperclip size={18} />
              <input type="file" className="hidden" multiple onChange={onAttach} />
            </label>
            <button className="p-2 rounded-md bg-white/5 border border-white/10 text-blue-100 hover:text-white">
              <Mic size={18} />
            </button>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={rows} placeholder="Message the AI…" className="flex-1 resize-none text-sm bg-white/5 border border-white/10 rounded-md px-3 py-2 text-blue-100 placeholder:text-blue-200/50 outline-none focus:ring-1 focus:ring-blue-400/50 max-h-40" />
            <button onClick={onSend} disabled={streaming} className={`px-3 py-2 rounded-md inline-flex items-center gap-2 ${streaming ? 'bg-blue-500/50' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
