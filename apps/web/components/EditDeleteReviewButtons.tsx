'use client'

import { useState } from 'react'
import { deleteReview } from '@/app/actions/deleteReview'
import { updateReview } from '@/app/actions/updateReview'

interface Props {
  reviewId: string
  initialRating: number
  initialComment: string | null
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-transform hover:scale-110 ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function EditDeleteReviewButtons({ reviewId, initialRating, initialComment }: Props) {
  const [mode, setMode]       = useState<'idle' | 'edit' | 'confirmDelete'>('idle')
  const [rating, setRating]   = useState(initialRating)
  const [comment, setComment] = useState(initialComment ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  async function handleSave() {
    if (rating === 0) { setError('Wybierz ocenę.'); return }
    setLoading(true)
    setError('')
    const result = await updateReview(reviewId, { rating, comment: comment || undefined })
    if (result.error) {
      setError(result.error)
    } else {
      setMode('idle')
      setDone(true)
    }
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    const result = await deleteReview(reviewId)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      setMode('idle')
    }
    // Po usunięciu strona się odświeży przez revalidatePath
  }

  if (done) {
    return <span className="text-xs text-emerald-600 font-semibold">✓ Zaktualizowano</span>
  }

  if (mode === 'edit') {
    return (
      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-sm font-bold text-gray-700">Edytuj opinię</p>
        <StarPicker value={rating} onChange={setRating} />
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Komentarz (opcjonalnie)"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={loading}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 rounded-xl text-sm transition disabled:opacity-50">
            {loading ? 'Zapisuję...' : 'Zapisz'}
          </button>
          <button onClick={() => { setMode('idle'); setError('') }}
            className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-100 font-bold py-2 rounded-xl text-sm transition">
            Anuluj
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'confirmDelete') {
    return (
      <div className="flex items-center gap-2 mt-1">
        <span className="text-xs text-gray-500">Na pewno usunąć?</span>
        <button onClick={handleDelete} disabled={loading}
          className="text-xs text-red-600 font-bold hover:underline disabled:opacity-50">
          {loading ? 'Usuwam...' : 'Tak, usuń'}
        </button>
        <button onClick={() => setMode('idle')} className="text-xs text-gray-400 hover:underline">
          Anuluj
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 mt-1">
      <button onClick={() => setMode('edit')}
        className="text-xs text-gray-400 hover:text-gray-700 font-semibold transition">
        Edytuj
      </button>
      <span className="text-gray-200">·</span>
      <button onClick={() => setMode('confirmDelete')}
        className="text-xs text-gray-400 hover:text-red-500 font-semibold transition">
        Usuń
      </button>
    </div>
  )
}
