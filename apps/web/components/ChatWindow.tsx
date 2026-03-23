'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Message {
  id: string
  content: string
  createdAt: string
  senderPerson?:       { firstName: string; lastName: string } | null
  senderCompany?:      { companyName: string } | null
  senderTargetPerson?: { firstName: string; lastName: string } | null
}

interface Props {
  conversationId: string
  currentUserId:  string
  currentRole:    'person' | 'company'
  isPersonB?:     boolean
  otherName:      string
}

export default function ChatWindow({ conversationId, currentUserId, currentRole, isPersonB = false, otherName }: Props) {
  const [messages,   setMessages]   = useState<Message[]>([])
  const [input,      setInput]      = useState('')
  const [sending,    setSending]    = useState(false)
  const [connected,  setConnected]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const seenIds   = useRef<Set<string>>(new Set())

  const addMessages = useCallback((newMsgs: Message[]) => {
    const fresh = newMsgs.filter(m => !seenIds.current.has(m.id))
    if (!fresh.length) return
    fresh.forEach(m => seenIds.current.add(m.id))
    setMessages(prev => [...prev, ...fresh])
  }, [])

  useEffect(() => {
    fetch(`/api/chat/${conversationId}`)
      .then(r => r.json())
      .then(data => { if (data.messages) addMessages(data.messages) })
  }, [conversationId, addMessages])

  useEffect(() => {
    let es: EventSource
    const connect = () => {
      es = new EventSource(`/api/chat/${conversationId}/stream`)
      es.onopen    = () => setConnected(true)
      es.onmessage = e => { const d = JSON.parse(e.data); if (d.type === 'messages') addMessages(d.messages) }
      es.onerror   = () => { setConnected(false); es.close(); setTimeout(connect, 3000) }
    }
    connect()
    return () => es?.close()
  }, [conversationId, addMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    const res  = await fetch(`/api/chat/${conversationId}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body:   JSON.stringify({ content }),
    })
    const data = await res.json()
    if (data.message) addMessages([data.message])
    setSending(false)
  }

  function isOwn(msg: Message) {
    if (currentRole === 'company') return !!msg.senderCompany
    if (isPersonB) return !!msg.senderTargetPerson
    return !!msg.senderPerson
  }

  function senderName(msg: Message) {
    if (msg.senderPerson)       return `${msg.senderPerson.firstName} ${msg.senderPerson.lastName}`
    if (msg.senderCompany)      return msg.senderCompany.companyName
    if (msg.senderTargetPerson) return `${msg.senderTargetPerson.firstName} ${msg.senderTargetPerson.lastName}`
    return 'Nieznany'
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Status */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-50 bg-gray-50/50 shrink-0">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
        <span className="text-xs text-gray-400">{connected ? 'Połączono' : 'Łączenie...'}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center py-10 text-sm text-gray-400">
            Brak wiadomości. Napisz coś!
          </p>
        )}
        {messages.map(msg => {
          const own = isOwn(msg)
          return (
            <div key={msg.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[78%]">
                {!own && (
                  <p className="text-xs font-semibold mb-1 px-1" style={{ color: '#f97015' }}>{senderName(msg)}</p>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  own
                    ? 'text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
                  style={own ? { background: '#f97015', borderBottomRightRadius: 4 } : { borderBottomLeftRadius: 4 }}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 text-right ${own ? 'text-white/60' : 'text-gray-400'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex gap-2 border-t border-gray-100 shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Napisz wiadomość..."
          maxLength={2000}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all bg-white text-gray-900"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-30 shrink-0"
          style={{ background: '#f97015' }}>
          {sending ? '...' : '→'}
        </button>
      </div>
    </div>
  )
}
