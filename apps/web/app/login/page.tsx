'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [error,             setError]             = useState<string | null>(null)
  const [loading,           setLoading]           = useState(false)
  const [socialLoading,     setSocialLoading]     = useState<string | null>(null)
  const [unverifiedEmail,   setUnverifiedEmail]   = useState<string | null>(null)
  const [resendSent,        setResendSent]        = useState(false)
  const [resendLoading,     setResendLoading]     = useState(false)

  async function handleSocialLogin(provider: string) {
    setSocialLoading(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

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

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)' }}>

      {/* Lewa — dekoracja glassmorphism */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden glass-card m-6">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #f97015 0%, transparent 60%)' }} />

        <Link href="/" className="relative flex items-center">
          <Image src="/IMG/logo/Logo_Zlap_Fuche.png" alt="PracaTymczasowa" width={130} height={34}
            className="h-8 w-auto" style={{ filter: 'brightness(0) saturate(100%)' }} />
        </Link>

        <div className="relative space-y-8">
          <div>
            <p className="text-5xl font-black text-gray-900 leading-tight mb-3" style={{ fontFamily: "'omnes-pro', sans-serif" }}>
              Witaj z<br />powrotem.
            </p>
            <p className="text-gray-500 text-lg">Zaloguj się i znajdź pracę dziś.</p>
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

        <p className="text-xs text-gray-400 relative">© {new Date().getFullYear()} PracaTymczasowa</p>
      </div>

      {/* Prawa — formularz */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center mb-8">
            <Image src="/IMG/logo/Logo_Zlap_Fuche.png" alt="PracaTymczasowa" width={120} height={32} className="h-8 w-auto" />
          </Link>

          <div className="glass-card p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 mb-1.5" style={{ letterSpacing: '-0.02em' }}>Zaloguj się</h1>
              <p className="text-gray-500 text-sm">Nie masz konta?{' '}
                <Link href="/register" className="font-semibold hover:underline" style={{ color: '#f97015' }}>Zarejestruj się</Link>
              </p>
            </div>

            {/* Social login buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={!!socialLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {socialLoading === 'google' ? 'Logowanie...' : 'Kontynuuj z Google'}
              </button>

              <button
                onClick={() => handleSocialLogin('facebook')}
                disabled={!!socialLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {socialLoading === 'facebook' ? 'Logowanie...' : 'Kontynuuj z Facebook'}
              </button>

              <button
                onClick={() => handleSocialLogin('linkedin')}
                disabled={!!socialLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                {socialLoading === 'linkedin' ? 'Logowanie...' : 'Kontynuuj z LinkedIn'}
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <p className="text-xs text-gray-400">lub</p>
              <div className="flex-1 h-px bg-gray-200"></div>
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
                  placeholder="twoj@email.pl" className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-gray-700">Hasło</label>
                  <Link href="/forgot-password" className="text-xs font-semibold hover:underline" style={{ color: '#f97015' }}>
                    Zapomniałeś hasła?
                  </Link>
                </div>
                <input name="password" type="password" required autoComplete="current-password"
                  placeholder="••••••••" className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm" />
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
    </div>
  )
}
