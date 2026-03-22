'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Global error:', error) }, [error])

  return (
    <html>
      <body style={{ background: '#FCFAF8', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ width: 96, height: 96, borderRadius: 24, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', fontSize: 48 }}>
              ⚠️
            </div>
            <p style={{ fontSize: 96, fontWeight: 900, color: '#f3f4f6', margin: '0 0 8px', letterSpacing: '-4px' }}>500</p>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 12px' }}>Coś poszło nie tak</h1>
            <p style={{ color: '#6b7280', marginBottom: 32, lineHeight: 1.6, fontSize: 14 }}>
              Wystąpił nieoczekiwany błąd. Spróbuj ponownie lub wróć na stronę główną.
            </p>
            {error.digest && (
              <p style={{ fontSize: 12, color: '#9ca3af', background: '#f9fafb', padding: '8px 16px', borderRadius: 8, display: 'inline-block', marginBottom: 24, fontFamily: 'monospace' }}>
                ID błędu: {error.digest}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={reset}
                style={{ padding: '12px 24px', background: '#f97015', color: '#fff', fontWeight: 700, borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 14 }}>
                Spróbuj ponownie
              </button>
              <a href="/"
                style={{ padding: '12px 24px', background: '#fff', color: '#374151', fontWeight: 700, borderRadius: 12, border: '1px solid #e5e7eb', textDecoration: 'none', fontSize: 14 }}>
                Strona główna
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
