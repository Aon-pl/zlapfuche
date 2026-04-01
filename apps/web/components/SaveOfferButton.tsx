'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  offerId: string
  initialSaved: boolean
  isLoggedIn: boolean
}

export default function SaveOfferButton({ offerId, initialSaved, isLoggedIn }: Props) {
  const [saved, setSaved]     = useState(initialSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setLoading(true)
    try {
      const res  = await fetch('/api/saved-offers', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ offerId }),
      })
      const data = await res.json()
      if (res.ok) setSaved(data.saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Usuń z ulubionych' : 'Zapisz ofertę'}
      className="flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-sm transition hover:opacity-80 disabled:opacity-40 w-full justify-center"
      style={saved
        ? { background: 'rgba(249,112,21,0.15)', color: '#f97015', border: '1px solid rgba(249,112,21,0.3)' }
        : { background: 'rgba(255,255,255,0.5)', color: '#64748b', border: '1px solid rgba(255,255,255,0.5)' }
      }
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 rounded-full animate-spin"
          style={{ borderColor: 'transparent', borderTopColor: 'currentColor' }} />
      ) : (
        <span>{saved ? '★' : '☆'}</span>
      )}
      {saved ? 'Zapisano' : 'Zapisz ofertę'}
    </button>
  )
}
