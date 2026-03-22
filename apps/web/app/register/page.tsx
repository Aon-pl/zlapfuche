'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { register } from '@/app/actions/auth'

type Role = 'person' | 'company'

export default function RegisterPage() {
  const [role,    setRole]    = useState<Role>('person')
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    formData.set('role', role)
    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"

  return (
    <div className="min-h-screen flex" style={{ background: '#FCFAF8' }}>

      {/* Lewa — dekoracja */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{ background: '#1D212B' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #f97015 0%, transparent 60%)' }} />

        <Link href="/" className="relative flex items-center">
          <Image src="/IMG/logo/Logo_Zlap_Fuche.png" alt="PracaTymczasowa" width={130} height={34}
            className="h-8 w-auto brightness-0 invert" />
        </Link>

        <div className="relative space-y-6">
          <p className="text-5xl font-black text-white leading-tight" style={{ fontFamily: "'omnes-pro', sans-serif" }}>
            Dołącz do<br /><span style={{ color: '#f97015' }}>tysięcy</span><br />użytkowników.
          </p>
          <div className="space-y-3">
            {[
              '✅ Bezpłatne konto dla pracowników',
              '✅ Oferty z całej Polski',
              '✅ Szybka rekrutacja — 24h',
            ].map(t => (
              <p key={t} className="text-sm text-gray-400">{t}</p>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 relative">© {new Date().getFullYear()} PracaTymczasowa</p>
      </div>

      {/* Prawa — formularz */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <Link href="/" className="lg:hidden flex items-center mb-8">
            <Image src="/IMG/logo/Logo_Zlap_Fuche.png" alt="PracaTymczasowa" width={120} height={32} className="h-8 w-auto" />
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-1.5" style={{ letterSpacing: '-0.02em' }}>Utwórz konto</h1>
            <p className="text-gray-500 text-sm">Masz już konto?{' '}
              <Link href="/login" className="font-semibold hover:underline" style={{ color: '#f97015' }}>Zaloguj się</Link>
            </p>
          </div>

          {/* Wybór roli */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([['person', '👤', 'Osoba prywatna', 'Szukam pracy'], ['company', '🏢', 'Firma', 'Szukam pracowników']] as [Role, string, string, string][]).map(([r, icon, label, sub]) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  role === r
                    ? 'border-orange-400 bg-orange-50 scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-orange-200'
                }`}>
                <p className="text-2xl mb-1.5">{icon}</p>
                <p className={`font-bold text-sm ${role === r ? 'text-orange-600' : 'text-gray-700'}`}>{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </button>
            ))}
          </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Hasło</label>
              <input name="password" type="password" required minLength={8} autoComplete="new-password"
                placeholder="Min. 8 znaków" className={inputClass} />
            </div>

            {role === 'person' ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Imię</label>
                  <input name="firstName" required placeholder="Jan" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nazwisko</label>
                  <input name="lastName" required placeholder="Kowalski" className={inputClass} />
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nazwa firmy</label>
                  <input name="companyName" required placeholder="Nazwa Sp. z o.o." className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Miasto</label>
                  <input name="city" required placeholder="Warszawa" className={inputClass} />
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 font-bold rounded-xl text-white transition-all hover:opacity-90 hover:scale-[1.01] disabled:opacity-50 disabled:scale-100 text-sm"
              style={{ background: '#f97015' }}>
              {loading ? 'Tworzenie konta...' : 'Utwórz konto →'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Rejestrując się akceptujesz{' '}
              <Link href="/terms" className="underline hover:text-gray-600">regulamin</Link>{' '}
              i{' '}
              <Link href="/privacy" className="underline hover:text-gray-600">politykę prywatności</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
