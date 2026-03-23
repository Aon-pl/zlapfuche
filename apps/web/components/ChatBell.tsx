'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Props {
  dark?: boolean
}

export default function ChatBell({ dark = false }: Props) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch('/api/chat/unread')
        if (res.ok) {
          const data = await res.json()
          setUnread(data.count ?? 0)
        }
      } catch {}
    }

    fetchUnread()
    const interval = setInterval(fetchUnread, 15000) // co 15s
    return () => clearInterval(interval)
  }, [])

  const iconColor = dark ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'

  return (
    <Link href="/chat" className={`relative p-2 rounded-xl transition ${iconColor}`} title="Wiadomości">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
      </svg>
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-amber-400 text-gray-900 text-xs font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  )
}
