'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  createdAt: string
  read: boolean
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [count, setCount]                 = useState(0)
  const [open, setOpen]                   = useState(false)
  const dropdownRef                       = useRef<HTMLDivElement>(null)

  // Połączenie SSE
  useEffect(() => {
    let es: EventSource

    const connect = () => {
      es = new EventSource('/api/notifications/stream')

      es.onmessage = (e) => {
        const data = JSON.parse(e.data)

        if (data.type === 'init') {
          setNotifications(data.notifications)
          setCount(data.count)
        }

        if (data.type === 'new') {
          setNotifications(prev => {
            const ids = new Set(prev.map((n: Notification) => n.id))
            const fresh = data.notifications.filter((n: Notification) => !ids.has(n.id))
            return [...fresh, ...prev]
          })
          setCount(data.count)
        }
      }

      es.onerror = () => {
        es.close()
        setTimeout(connect, 5000)
      }
    }

    connect()
    return () => es?.close()
  }, [])

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = useCallback(async () => {
    await fetch('/api/notifications/read', { method: 'PATCH' })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setCount(0)
  }, [])

  const markOneRead = useCallback(async (id: string) => {
    await fetch('/api/notifications/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setCount(prev => Math.max(0, prev - 1))
  }, [])

  function formatTime(iso: string) {
    const diff  = Date.now() - new Date(iso).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 1)   return 'przed chwilą'
    if (mins < 60)  return `${mins} min temu`
    if (hours < 24) return `${hours}h temu`
    return `${days}d temu`
  }

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Dzwonek */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl transition hover:opacity-80"
        style={{ background: open ? 'rgba(255,255,255,0.1)' : 'transparent' }}
        title="Powiadomienia"
      >
        <span className="text-lg">🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-black rounded-full"
            style={{ background: '#ef4444', color: '#fff' }}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="font-black text-white text-sm">
              Powiadomienia {count > 0 && <span className="text-xs font-bold ml-1" style={{ color: '#ef4444' }}>({count})</span>}
            </span>
            {count > 0 && (
              <button onClick={markAllRead}
                className="text-xs font-bold hover:underline transition"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                Oznacz jako przeczytane
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Brak powiadomień</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markOneRead(n.id)}
                  className="w-full text-left px-4 py-3 transition hover:opacity-80"
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: n.read ? 'transparent' : 'rgba(232,197,71,0.05)',
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: '#E8C547' }} />
                    )}
                    <div className={`flex-1 ${n.read ? 'pl-4' : ''}`}>
                      <p className="text-sm font-semibold" style={{ color: n.read ? 'rgba(255,255,255,0.5)' : '#fff' }}>
                        {n.title}
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {n.message}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {formatTime(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <a href="/notifications" className="text-xs font-bold hover:underline block text-center transition"
              style={{ color: 'rgba(255,255,255,0.4)' }}>
              Zobacz wszystkie →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
