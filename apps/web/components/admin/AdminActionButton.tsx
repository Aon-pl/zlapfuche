'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  endpoint: string
  label: string
  body: Record<string, unknown>
  variant?: 'success' | 'warning' | 'default'
}

export default function AdminActionButton({ endpoint, label, body, variant = 'default' }: Props) {
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const STYLES = {
    success: { background: 'rgba(52,211,153,0.1)',  color: '#34d399', border: '1px solid rgba(52,211,153,0.2)'  },
    warning: { background: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)'  },
    default: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' },
  }

  function handleClick() {
    startTransition(async () => {
      await fetch(endpoint, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      router.refresh()
    })
  }

  return (
    <button onClick={handleClick} disabled={pending}
      className="text-xs font-bold px-3 py-1.5 rounded-xl transition hover:opacity-80 disabled:opacity-40"
      style={STYLES[variant]}>
      {pending ? '...' : label}
    </button>
  )
}
