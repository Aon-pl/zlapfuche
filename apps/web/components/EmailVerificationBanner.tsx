'use client'

import { useState } from 'react'

interface Props {
  email: string
}

export default function EmailVerificationBanner({ email }: Props) {
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function resend() {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
      if (res.ok) setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full px-4 py-3 flex items-center justify-between gap-4 text-sm"
      style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a' }}>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-lg shrink-0">✉️</span>
        <p className="text-amber-800 truncate">
          {sent
            ? `Link weryfikacyjny wysłany na ${email}. Sprawdź skrzynkę.`
            : <>Zweryfikuj swój adres email <span className="font-bold">{email}</span>, aby korzystać ze wszystkich funkcji.</>
          }
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!sent && (
          <button
            onClick={resend}
            disabled={loading}
            className="font-bold px-3 py-1.5 rounded-lg text-xs transition hover:opacity-80 disabled:opacity-40"
            style={{ background: '#f59e0b', color: '#fff' }}>
            {loading ? 'Wysyłanie...' : 'Wyślij link'}
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-800 transition text-lg leading-none"
          title="Zamknij">
          ×
        </button>
      </div>
    </div>
  )
}
