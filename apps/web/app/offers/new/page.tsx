'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOffer } from '@/app/actions/offers'

const CATEGORIES = [
  { value: 'warehouse',     label: 'Magazyn',     icon: '📦' },
  { value: 'construction',  label: 'Budowlanka',  icon: '🏗️' },
  { value: 'hospitality',   label: 'Gastronomia', icon: '🍽️' },
  { value: 'transport',     label: 'Transport',   icon: '🚛' },
  { value: 'retail',        label: 'Handel',      icon: '🛒' },
  { value: 'manufacturing', label: 'Produkcja',   icon: '⚙️' },
  { value: 'cleaning',      label: 'Sprzatanie',  icon: '🧹' },
  { value: 'agriculture',   label: 'Rolnictwo',   icon: '🌾' },
  { value: 'office',        label: 'Biuro',       icon: '💼' },
  { value: 'other',         label: 'Inne',        icon: '🔧' },
]

const SALARY_TYPES = [
  { value: 'hourly',  label: 'Za godzine'  },
  { value: 'daily',   label: 'Za dzien'    },
  { value: 'monthly', label: 'Miesieczenie' },
]

const STEPS = ['Podstawowe', 'Szczegoly', 'Wynagrodzenie']
type Step = 1 | 2 | 3

export default function NewOfferPage() {
  const router  = useRouter()
  const [step,    setStep]    = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '', category: '', city: '', postalCode: '', address: '', remote: false,
    description: '', requirements: '', salaryMin: '', salaryMax: '',
    salaryType: 'hourly', startDate: '', endDate: '',
    hoursPerWeek: '', minAge: '18', drivingLicense: false,
  })

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const canProceed = () => {
    if (step === 1) return !!(form.title && form.category && form.city && form.postalCode)
    if (step === 2) return !!(form.description && form.startDate)
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const formData = new FormData()
    Object.entries(form).forEach(([k, v]) => formData.set(k, String(v)))
    const result = await createOffer(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.offerId) {
      router.push(`/offers/${result.offerId}`)
    } else {
      setError('Wystapil nieoczekiwany blad.')
      setLoading(false)
    }
  }

  const inp = "w-full px-4 py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm"
  const lbl = "block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5"

  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <div onClick={onClick}
      className="w-11 h-6 rounded-full flex items-center px-0.5 cursor-pointer transition-all"
      style={{ background: active ? '#f97015' : '#e5e7eb' }}>
      <div className={`w-5 h-5 rounded-full bg-white shadow transition-all ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  )

  const catSelected = CATEGORIES.find(c => c.value === form.category)

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
            Dodaj oferte pracy
          </h1>
          <p className="text-gray-500 text-sm">Wypelnij formularz aby opublikowac ogloszenie</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Pasek postepu */}
        <div className="flex items-center gap-2 mb-6">
          {STEPS.map((s, i) => {
            const n = (i + 1) as Step
            return (
              <div key={n} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                  step > n ? 'bg-green-500 text-white' : 'text-white'
                }`}
                  style={step === n ? { background: '#f97015' } :
                         step > n ? {} :
                         { background: '#f3f4f6', color: '#9ca3af' }}>
                  {step > n ? '✓' : n}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${step >= n ? 'text-gray-700' : 'text-gray-400'}`}>{s}</span>
                {i < 2 && <div className={`flex-1 h-px ${step > n ? 'bg-green-400' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-8">

          {/* KROK 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Podstawowe informacje</h2>
                <p className="text-sm text-gray-400 mb-5">Pola oznaczone * sa wymagane</p>
              </div>

              <div>
                <label className={lbl}>Tytul ogloszenia *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="np. Pracownik magazynowy, Kelner, Kierowca..." className={inp} />
              </div>

              <div>
                <label className={lbl}>Kategoria *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => set('category', cat.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        form.category === cat.value ? 'scale-[1.02]' : 'border-gray-200 hover:border-orange-200 bg-white'
                      }`}
                      style={form.category === cat.value
                        ? { borderColor: '#f97015', background: 'rgba(249,112,21,0.08)' } : {}}>
                      <span className="text-xl">{cat.icon}</span>
                      <span className={`block text-xs font-semibold mt-1 ${form.category === cat.value ? '' : 'text-gray-600'}`}
                        style={form.category === cat.value ? { color: '#f97015' } : {}}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Miasto *</label>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="np. Warszawa" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Kod pocztowy *</label>
                  <input value={form.postalCode} onChange={e => set('postalCode', e.target.value)}
                    placeholder="00-000" maxLength={6} className={inp} />
                  <p className="text-xs text-gray-400 mt-1">Potrzebny do wyswietlenia na mapie</p>
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Adres</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="ul. Przykladowa 1" className={inp} />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <Toggle active={form.remote} onClick={() => set('remote', !form.remote)} />
                <span className="text-sm text-gray-700 font-medium">Praca zdalna mozliwa</span>
              </label>
            </div>
          )}

          {/* KROK 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 mb-5">Szczegoly oferty</h2>

              <div>
                <label className={lbl}>Opis stanowiska *</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={6} placeholder="Opisz zakres obowiazkow, warunki pracy..."
                  className={`${inp} resize-none`} />
              </div>

              <div>
                <label className={lbl}>Wymagania (opcjonalnie)</label>
                <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)}
                  rows={3} placeholder="np. doswiadczenie, uprawnienia, certyfikaty..."
                  className={`${inp} resize-none`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Data rozpoczecia *</label>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Data zakonczenia (opcjonalnie)</label>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={lbl}>Godzin / tydzien</label>
                  <input type="number" min={1} max={80} value={form.hoursPerWeek}
                    onChange={e => set('hoursPerWeek', e.target.value)} placeholder="np. 40" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Minimalny wiek</label>
                  <input type="number" min={15} max={99} value={form.minAge}
                    onChange={e => set('minAge', e.target.value)} className={inp} />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <Toggle active={form.drivingLicense} onClick={() => set('drivingLicense', !form.drivingLicense)} />
                <span className="text-sm text-gray-700 font-medium">Wymagane prawo jazdy</span>
              </label>
            </div>
          )}

          {/* KROK 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-bold text-gray-900 mb-5">Wynagrodzenie</h2>

              <div>
                <label className={lbl}>Rodzaj wynagrodzenia</label>
                <div className="flex gap-2">
                  {SALARY_TYPES.map(st => (
                    <button key={st.value} type="button" onClick={() => set('salaryType', st.value)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        form.salaryType === st.value ? '' : 'border-gray-200 text-gray-500 hover:border-orange-200'
                      }`}
                      style={form.salaryType === st.value
                        ? { borderColor: '#f97015', background: 'rgba(249,112,21,0.08)', color: '#f97015' } : {}}>
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Stawka od (PLN)</label>
                  <input type="number" min={0} value={form.salaryMin}
                    onChange={e => set('salaryMin', e.target.value)} placeholder="np. 25" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Stawka do (PLN)</label>
                  <input type="number" min={0} value={form.salaryMax}
                    onChange={e => set('salaryMax', e.target.value)} placeholder="np. 35" className={inp} />
                </div>
              </div>

              <p className="text-xs text-gray-400 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                Pola wynagrodzenia sa opcjonalne. Mozesz podac tylko minimum, tylko maksimum lub obie wartosci.
              </p>

              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-2.5">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Podsumowanie oferty</h3>
                {[
                  { label: 'Tytul',        value: form.title },
                  { label: 'Kategoria',    value: catSelected ? `${catSelected.icon} ${catSelected.label}` : '-' },
                  { label: 'Miasto',       value: form.city || '-' },
                  { label: 'Kod pocztowy', value: form.postalCode || '-' },
                  { label: 'Start',        value: form.startDate ? new Date(form.startDate).toLocaleDateString('pl-PL') : '-' },
                  ...(form.salaryMin || form.salaryMax ? [{
                    label: 'Wynagrodzenie',
                    value: form.salaryMin && form.salaryMax ? `${form.salaryMin}-${form.salaryMax} PLN`
                          : form.salaryMin ? `od ${form.salaryMin} PLN` : `do ${form.salaryMax} PLN`,
                    orange: true,
                  }] : []),
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold" style={(item as any).orange ? { color: '#f97015' } : { color: '#111827' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-5">
          <button type="button" onClick={() => step > 1 && setStep((step - 1) as Step)} disabled={step === 1}
            className="px-6 py-3 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-gray-900 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold">
            Wstecz
          </button>

          {step < 3 ? (
            <button type="button" onClick={() => canProceed() && setStep((step + 1) as Step)} disabled={!canProceed()}
              className="px-8 py-3 font-bold rounded-xl text-white text-sm transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
              style={{ background: '#f97015' }}>
              Dalej
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="px-8 py-3 font-bold rounded-xl text-white text-sm transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
              style={{ background: '#f97015' }}>
              {loading ? 'Publikuje...' : 'Opublikuj oferte'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
