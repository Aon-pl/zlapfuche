'use client'

import { useState } from 'react'
import { deleteReview } from '@/app/actions/deleteReview'

export default function DeleteReviewButton({ reviewId, onDeleted }: { reviewId: string; onDeleted?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const result = await deleteReview(reviewId)
    if (result.success) {
      onDeleted?.()
    }
    setLoading(false)
    setConfirm(false)
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Na pewno?</span>
        <button onClick={handleDelete} disabled={loading}
          className="text-xs text-red-600 font-bold hover:underline disabled:opacity-50">
          {loading ? 'Usuwam...' : 'Tak, usuń'}
        </button>
        <button onClick={() => setConfirm(false)} className="text-xs text-gray-400 hover:underline">
          Anuluj
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirm(true)}
      className="text-xs text-gray-400 hover:text-red-500 transition font-semibold">
      Usuń
    </button>
  )
}
