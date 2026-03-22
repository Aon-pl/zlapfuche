'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { applyForOffer } from '@/app/actions/applications'

interface Props {
  offerId: string
  personProfileId: string | null
  isLoggedIn: boolean
  alreadyApplied: boolean
}

export default function ApplyButton({ offerId, personProfileId, isLoggedIn, alreadyApplied }: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applied, setApplied] = useState(alreadyApplied)

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="block w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-center rounded-xl transition-all duration-200 hover:scale-[1.02]"
      >
        Zaloguj się aby aplikować
      </a>
    )
  }

  if (!personProfileId) {
    return (
      <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-400 text-sm text-center">
        Tylko osoby prywatne mogą aplikować.
      </div>
    )
  }

  if (applied) {
    return (
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm text-center font-semibold">
        ✓ Aplikacja wysłana
      </div>
    )
  }

  async function handleApply() {
    setLoading(true)
    setError(null)
    const result = await applyForOffer(offerId, coverLetter || null)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setApplied(true)
      setShowModal(false)
      router.refresh()
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold rounded-xl transition-all duration-200 hover:scale-[1.02]"
      >
        Aplikuj teraz
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-black text-white mb-2">Wyślij aplikację</h3>
            <p className="text-zinc-400 text-sm mb-6">Możesz dodać list motywacyjny lub od razu wysłać aplikację.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
            )}

            <div className="mb-5">
              <label className="block text-sm text-zinc-400 mb-2">
                List motywacyjny <span className="text-zinc-600">(opcjonalnie)</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Napisz kilka słów o sobie i dlaczego chcesz pracować na tym stanowisku..."
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-white placeholder-zinc-600 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-xl transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/50 text-zinc-950 font-bold rounded-xl transition-all"
              >
                {loading ? 'Wysyłanie...' : 'Wyślij aplikację'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
