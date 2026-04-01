'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function AdminOffersSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const q = searchParams.get('q') || ''
  const status = searchParams.get('status') || 'all'

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`/dashboard/admin/offers?${params.toString()}`))
  }

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Szukaj..."
        value={q}
        onChange={e => update('q', e.target.value)}
        className="px-4 py-2 rounded-xl text-sm text-white placeholder-white/40"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
      <select
        value={status}
        onChange={e => update('status', e.target.value)}
        className="px-3 py-2 rounded-xl text-sm text-white"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <option value="all" className="text-black">Wszystkie</option>
        <option value="active" className="text-black">Aktywne</option>
        <option value="paused" className="text-black">Wstrzymane</option>
        <option value="closed" className="text-black">Zamknięte</option>
        <option value="expired" className="text-black">Wygasłe</option>
        <option value="blocked" className="text-black">Zablokowane</option>
      </select>
      {pending && <span className="text-xs text-white/40">Szukam...</span>}
    </div>
  )
}