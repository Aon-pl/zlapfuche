'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  personId?: string
  companyId?: string
  targetPersonId?: string
  jobOfferId?: string
  label?: string
}

export default function StartChatButton({ personId, companyId, targetPersonId, jobOfferId, label = 'Napisz wiadomość' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, companyId, targetPersonId, jobOfferId }),
    })

    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push(`/chat/${data.conversationId}`)
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm"
      >
        <span>💬</span>
        {loading ? 'Otwieranie...' : label}
      </button>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
