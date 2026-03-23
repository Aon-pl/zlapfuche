'use client'

import { useState } from 'react'
import StarRating from './StarRating'
import { reviewCompany, reviewPerson } from '@/app/actions/reviews'

interface ReviewFormProps {
  type: 'company' | 'person'
  targetId: string
  targetName: string
  jobOfferId?: string
  onSuccess?: () => void
}

export default function ReviewForm({ type, targetId, targetName, jobOfferId, onSuccess }: ReviewFormProps) {
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Wybierz ocenę.'); return }
    setLoading(true)
    setError('')

    const result = type === 'company'
      ? await reviewCompany({ companyId: targetId, rating, comment: comment || undefined, jobOfferId })
      : await reviewPerson({ personId: targetId, rating, comment: comment || undefined, jobOfferId })

    if (result.error) {
      setError(result.error)
    } else {
      setDone(true)
      onSuccess?.()
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-700 font-semibold">✅ Dziękujemy za ocenę!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <h3 className="font-bold text-slate-800">
        Oceń {type === 'company' ? 'firmę' : 'pracownika'}: <span className="text-yellow-600">{targetName}</span>
      </h3>

      <div>
        <p className="text-sm text-slate-500 mb-1">Ocena</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="text-sm text-slate-500 mb-1 block">Komentarz (opcjonalnie)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Opisz swoją współpracę..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300"
        />
        <p className="text-xs text-slate-400 text-right">{comment.length}/500</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-2.5 rounded-xl transition disabled:opacity-50"
      >
        {loading ? 'Wysyłanie...' : 'Wyślij ocenę'}
      </button>
    </form>
  )
}
