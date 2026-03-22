'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  reviewId: string
}

export default function CompanyReplyButton({ reviewId }: Props) {
  const [open,    setOpen]    = useState(false)
  const [reply,   setReply]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim()) return
    setSaving(true)
    setError(null)

    const res  = await fetch(`/api/reviews/${reviewId}/reply`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ reply }),
    })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
      setSaving(false)
    } else {
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-bold text-amber-600 hover:text-amber-700 transition px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100">
        💬 Odpowiedz na opinię
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
      <p className="text-xs font-black text-amber-700">Odpowiedź firmy:</p>
      <textarea
        value={reply}
        onChange={e => setReply(e.target.value)}
        rows={3}
        placeholder="Napisz odpowiedź na tę opinię..."
        className="w-full px-3 py-2 bg-white border border-amber-200 focus:border-amber-400 rounded-xl text-sm text-gray-700 outline-none resize-none transition-all"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving || !reply.trim()}
          className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold rounded-lg text-xs transition-all">
          {saving ? 'Wysyłanie...' : 'Opublikuj odpowiedź'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="px-4 py-1.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-lg text-xs transition-all hover:bg-gray-50">
          Anuluj
        </button>
      </div>
    </form>
  )
}
