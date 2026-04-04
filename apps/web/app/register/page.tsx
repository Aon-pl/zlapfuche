'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signIn } from 'next-auth/react'
import { register } from '@/app/actions/auth'

type Role = 'person' | 'company'

interface MFCompanyData {
  name: string
  nip: string
  statusVat: string
  regon: string
  krs: string | null
  residenceAddress: string | null
  workingAddress: string | null
  registrationLegalDate: string | null
  accountNumbers: string[]
  hasVirtualAccounts: boolean
}

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('company')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [gusLoading, setGusLoading] = useState(false)
  const [gusError, setGusError] = useState<string | null>(null)
  const [gusSuccess, setGusSuccess] = useState(false)

  async function handleSocialLogin(provider: string) {
    setSocialLoading(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  const [companyData, setCompanyData] = useState({
    nip: '',
    companyName: '',
    city: '',
    address: '',
    postalCode: '',
  })

  async function handleNIPLookup() {
    const nip = companyData.nip.replace(/[^0-9]/g, '')
    if (nip.length !== 10) {
      setGusError('NIP musi mieć 10 cyfr')
      return
    }

    setGusLoading(true)
    setGusError(null)
    setGusSuccess(false)

    try {
      const res = await fetch('/api/gus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip }),
      })

      const data = await res.json()

      if (!res.ok) {
        setGusError((data as { error?: string }).error || 'Nie znaleziono firmy o tym NIP')
        setGusLoading(false)
        return
      }

      const companyData = data as MFCompanyData

      const addressStr = companyData.workingAddress || companyData.residenceAddress || ''
      const postalCodeMatch = addressStr.match(/\d{2}-\d{3}/)
      const postalCode = postalCodeMatch ? postalCodeMatch[0] : ''
      const addressWithoutPostal = addressStr.replace(/\d{2}-\d{3}\s*/, '').trim()
      const cityMatch = addressWithoutPostal.match(/[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:\s[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*$/)
      const city = cityMatch ? cityMatch[0].trim() : ''
      const address = addressWithoutPostal.replace(/,?\s*[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:\s[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*$/, '').trim()

      setCompanyData(prev => ({
        ...prev,
        nip: companyData.nip,
        companyName: companyData.name,
        city: city,
        address: address,
        postalCode: postalCode,
      }))

      setGusSuccess(true)
      setTimeout(() => setGusSuccess(false), 3000)
    } catch {
      setGusError('Błąd połączenia z MF API')
    } finally {
      setGusLoading(false)
    }
  }

  function handleNIPChange(value: string) {
    const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10)
    setCompanyData(prev => ({ ...prev, nip: digitsOnly }))
    setGusError(null)
    setGusSuccess(false)
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    if (role === 'company') {
      companyData.nip && formData.set('nip', companyData.nip)
      companyData.companyName && formData.set('companyName', companyData.companyName)
      companyData.city && formData.set('city', companyData.city)
      companyData.address && formData.set('address', companyData.address)
      companyData.postalCode && formData.set('postalCode', companyData.postalCode)
    }

    formData.set('role', role)
    const result = await register(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)' }}>

      {/* Lewa — dekoracja glassmorphism */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden glass-card m-6">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #f97015 0%, transparent 60%)' }} />

        <Link href="/" className="relative flex items-center">
          <Image src="/IMG/logo/Logo_Zlap_Fuche.png" alt="PracaTymczasowa" width={130} height={34}
            className="h-8 w-auto" style={{ filter: 'brightness(0) saturate(100%)' }} />
        </Link>

        <div className="relative space-y-6">
          <p className="text-5xl font-black text-gray-900 leading-tight" style={{ fontFamily: "'omnes-pro', sans-serif" }}>
            Dołącz do<br /><span style={{ color: '#f97015' }}>tysięcy</span><br />użytkowników.
          </p>
          <div className="space-y-3">
            {[
              '✅ Bezpłatne konto dla pracowników',
              '✅ Oferty z całej Polski',
              '✅ Szybka rekrutacja — 24h',
            ].map(t => (
              <p key={t} className="text-sm text-gray-500">{t}</p>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 relative">© {new Date().getFullYear()} PracaTymczasowa</p>
      </div>

      {/* Prawa — formularz */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-lg">

          <Link href="/" className="lg:hidden flex items-center mb-8">
            <Image src="/IMG/logo/Logo_Zlap_Fuche.png" alt="PracaTymczasowa" width={120} height={32} className="h-8 w-auto" />
          </Link>

          <div className="glass-card p-8">
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
                {socialLoading === 'google' ? 'Rejestracja...' : 'Zarejestruj z Google'}
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <p className="text-xs text-gray-400">lub</p>
              <div className="flex-1 h-px bg-gray-200"></div>
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
                  placeholder="twoj@email.pl" className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hasło</label>
                <input name="password" type="password" required minLength={8} autoComplete="new-password"
                  placeholder="Min. 8 znaków" className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm" />
              </div>

              {role === 'person' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Imię</label>
                    <input name="firstName" required placeholder="Jan" className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nazwisko</label>
                    <input name="lastName" required placeholder="Kowalski" className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm" />
                  </div>
                </div>
              ) : (
                <>
                  {/* NIP z przyciskiem wyszukiwania */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">NIP <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={companyData.nip}
                        onChange={(e) => handleNIPChange(e.target.value)}
                        placeholder="1234567890"
                        className="flex-1 px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"
                        maxLength={10}
                      />
                      <button
                        type="button"
                        onClick={handleNIPLookup}
                        disabled={gusLoading || companyData.nip.length !== 10}
                        className="px-4 py-3 rounded-xl font-bold text-white transition-all disabled:opacity-50 text-sm whitespace-nowrap"
                        style={{ background: '#f97015' }}
                      >
                        {gusLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </span>
                        ) : 'Szukaj'}
                      </button>
                    </div>
                    {gusError && (
                      <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{gusError}</p>
                    )}
                    {gusSuccess && (
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#22c55e' }}>
                        ✓ Dane firmy wypełnione automatycznie
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Wprowadź 10-cyfrowy NIP i kliknij "Szukaj"</p>
                  </div>

                  {/* Dane firmy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nazwa firmy <span className="text-red-500">*</span></label>
                    <input
                      name="companyName"
                      required
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Nazwa Sp. z o.o."
                      className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Miasto <span className="text-red-500">*</span></label>
                    <input
                      name="city"
                      required
                      value={companyData.city}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Warszawa"
                      className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adres</label>
                    <input
                      name="address"
                      value={companyData.address}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="ul. Przykładowa 123"
                      className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kod pocztowy</label>
                    <input
                      name="postalCode"
                      value={companyData.postalCode}
                      onChange={(e) => setCompanyData(prev => ({ ...prev, postalCode: e.target.value }))}
                      placeholder="00-001"
                      className="w-full px-4 py-3 glass-inset rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"
                    />
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
    </div>
  )
}
