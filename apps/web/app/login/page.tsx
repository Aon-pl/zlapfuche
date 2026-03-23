'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [error,             setError]             = useState<string | null>(null)
  const [loading,           setLoading]           = useState(false)
  const [unverifiedEmail,   setUnverifiedEmail]   = useState<string | null>(null)
  const [resendSent,        setResendSent]        = useState(false)
  const [resendLoading,     setResendLoading]     = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setUnverifiedEmail(null)
    setResendSent(false)

    const result = await login(formData)
    if (result?.error === 'EMAIL_NOT_VERIFIED') {
      setUnverifiedEmail(result.email ?? null)
    } else if (result?.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  async function resendVerification() {
    if (!unverifiedEmail) return
    setResendLoading(true)
    const res = await fetch('/api/resend-verification', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: unverifiedEmail }),
    })
    if (res.ok) setResendSent(true)
    setResendLoading(false)
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"

  return (
    <div className="min-h-screen flex" style={{ background: '#FCFAF8' }}>

      {/* Lewa — dekoracja */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{ background: '#1D212B' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f97015 0%, transparent 60%)' }} />

        <Link href="/" className="relative flex items-center">
          <Image src="/IMG/logo/Logo_Zlap_Fuche.png" alt="PracaTymczasowa" width={130} height={34}
            className="h-8 w-auto brightness-0 invert" />
        </Link>

        <div className="relative space-y-8">
          <div>
            <p className="text-5xl font-black text-white leading-tight mb-3" style={{ fontFamily: "'omnes-pro', sans-serif" }}>
              Witaj z<br />powrotem.
            </p>
            <p className="text-gray-400 text-lg">Zaloguj się i znajdź pracę dziś.</p>
          </div>

          <div className="flex gap-8">
            {[
              { value: '300k+', label: 'Użytkowników' },
              { value: '8',     label: 'Kategorii' },
              { value: '24h',   label: 'Do zatrudnienia' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-2xl font-black" style={{ color: '#f97015' }}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 relative">© {new Date().getFullYear()} PracaTymczasowa</p>
      </div>

      {/* Prawa — formularz */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center mb-8">
            <Image src="/IMG/logo/Logo_Zlap_Fuche.png" alt="PracaTymczasowa" width={120} height={32} className="h-8 w-auto" />
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-1.5" style={{ letterSpacing: '-0.02em' }}>Zaloguj się</h1>
            <p className="text-gray-500 text-sm">Nie masz konta?{' '}
              <Link href="/register" className="font-semibold hover:underline" style={{ color: '#f97015' }}>Zarejestruj się</Link>
            </p>
          </div>

          {/* Email niezweryfikowany */}
          {unverifiedEmail && (
            <div className="mb-5 p-4 rounded-xl border border-orange-200 bg-orange-50">
              <p className="font-semibold text-orange-800 text-sm mb-1">✉️ Zweryfikuj swój email</p>
              <p className="text-orange-700 text-sm mb-3">
                Konto <strong>{unverifiedEmail}</strong> nie zostało aktywowane.
              </p>
              {resendSent
                ? <p className="text-green-700 text-sm font-semibold">✅ Link wysłany!</p>
                : <button onClick={resendVerification} disabled={resendLoading}
                    className="text-sm font-bold px-4 py-2 rounded-lg transition disabled:opacity-40 text-white"
                    style={{ background: '#f97015' }}>
                    {resendLoading ? 'Wysyłanie...' : 'Wyślij link weryfikacyjny'}
                  </button>
              }
            </div>
          )}

          {error && (
            <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input name="email" type="email" required autoComplete="email"
                placeholder="twoj@email.pl" className={inputClass} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Hasło</label>
                <Link href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: '#f97015' }}>
                  Zapomniałeś hasła?
                </Link>
              </div>
              <input name="password" type="password" required autoComplete="current-password"
                placeholder="••••••••" className={inputClass} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 font-bold rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 disabled:scale-100 text-sm"
              style={{ background: '#f97015' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Logowanie...
                </span>
              ) : 'Zaloguj się'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
