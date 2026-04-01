'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  isBlocked: boolean
}

export default function AdminBlockButton({ userId, isBlocked }: Props) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleToggle() {
    startTransition(async () => {
      await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocked: !isBlocked }),
      })
      router.refresh()
    })
  }

  const STYLES = isBlocked
    ? { background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
    : { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }

  return (
    <button onClick={handleToggle} disabled={pending}
      className="text-xs font-bold px-3 py-1.5 rounded-xl transition hover:opacity-80 disabled:opacity-40"
      style={STYLES}>
      {pending ? '...' : isBlocked ? 'Odblokuj' : 'Blokuj'}
    </button>
  )
}
