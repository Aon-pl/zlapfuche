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
        className="block w-full py-4 font-bold text-center rounded-xl transition-all duration-200 hover:scale-[1.02]"
        style={{ background: '#f97015', color: 'white' }}
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
        className="w-full py-4 font-bold rounded-xl transition-all duration-200 hover:scale-[1.02]"
        style={{ background: '#f97015', color: 'white' }}
      >
        Aplikuj teraz
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card rounded-2xl p-8 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a2e' }}>Wyślij aplikację</h3>
            <p className="text-sm mb-6" style={{ color: '#64748b' }}>Możesz dodać list motywacyjny lub od razu wysłać aplikację.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm text-red-500" style={{ background: 'rgba(239,68,68,0.1)' }}>{error}</div>
            )}

            <div className="mb-5">
              <label className="block text-sm mb-2" style={{ color: '#64748b' }}>
                List motywacyjny <span style={{ color: '#94a3b8' }}>(opcjonalnie)</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                rows={5}
                placeholder="Napisz kilka słów o sobie..."
                className="w-full px-4 py-3 glass-inset rounded-xl text-sm outline-none transition-all resize-none"
                style={{ color: '#1a1a2e' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl transition-all"
                style={{ border: '1px solid #e5e7eb', color: '#64748b', background: 'rgba(255,255,255,0.5)' }}
              >
                Anuluj
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                className="flex-1 py-3 font-bold rounded-xl transition-all disabled:opacity-50"
                style={{ background: '#f97015', color: 'white' }}
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
