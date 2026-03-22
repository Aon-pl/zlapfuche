'use client'

import { useState } from 'react'
import { withdrawApplication } from '@/app/actions/applications'
import { useRouter } from 'next/navigation'

export default function WithdrawButton({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleWithdraw() {
    setLoading(true)
    const result = await withdrawApplication(applicationId)
    if (result?.error) {
      alert(result.error)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-zinc-400 text-xs">Na pewno?</span>
        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
        >
          {loading ? 'Wycofuję...' : 'Tak, wycofaj'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="text-xs px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-white rounded-lg transition-all"
        >
          Anuluj
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
    >
      Wycofaj aplikację
    </button>
  )
}
