'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface JobSeeker {
  id:             string
  active:         boolean
  title:          string
  description:    string | null
  city:           string
  skills:         string | null
  expectedSalary: number | null
  salaryType:     string
  availableFrom:  string | null
  drivingLicense: boolean
  experienceYears: number
}

export default function MyWorkerAdPage() {
  const router = useRouter()
  const [ad,       setAd]       = useState<JobSeeker | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [skillInput, setSkillInput] = useState('')
  const [skills,   setSkills]   = useState<string[]>([])

  useEffect(() => {
    fetch('/api/workers/my')
      .then(r => r.json())
      .then(data => {
        if (data.ad) {
          setAd(data.ad)
          setSkills(data.ad.skills ? JSON.parse(data.ad.skills) : [])
        }
        setLoading(false)
      })
  }, [])

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills(prev => [...prev, s])
      setSkillInput('')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('skills', JSON.stringify(skills))

    const res  = await fetch('/api/workers/my', {
      method:  'POST',
      body:    formData,
    })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
    } else {
      setSuccess(true)
      setAd(data.ad)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  async function toggleActive() {
    const res  = await fetch('/api/workers/my/toggle', { method: 'PATCH' })
    const data = await res.json()
    if (data.active !== undefined) setAd(prev => prev ? { ...prev, active: data.active } : prev)
  }

  const inputClass = "w-full px-4 py-3 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-slate-800 placeholder-slate-400 outline-none transition-all text-sm"
  const labelClass = "block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2"

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Moje ogłoszenie</h1>
            <p className="text-slate-500 text-sm mt-0.5">Widoczne dla firm poszukujących pracowników</p>
          </div>
          {ad && (
            <button onClick={toggleActive}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                ad.active
                  ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-green-50 hover:text-green-700'
              }`}>
              {ad.active ? '✅ Aktywne — kliknij by ukryć' : '⏸️ Ukryte — kliknij by aktywować'}
            </button>
          )}
        </div>

        {success && (
          <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-semibold">
            ✅ Ogłoszenie zapisane!
          </div>
        )}
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm">Podstawowe informacje</h2>

            <div>
              <label className={labelClass}>Tytuł ogłoszenia *</label>
              <input name="title" required defaultValue={ad?.title ?? ''}
                placeholder="np. Szukam pracy jako operator wózka widłowego"
                className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Miasto *</label>
                <input name="city" required defaultValue={ad?.city ?? ''}
                  placeholder="np. Warszawa" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Doświadczenie (lata)</label>
                <input name="experienceYears" type="number" min={0} max={50}
                  defaultValue={ad?.experienceYears ?? 0} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Opis (opcjonalnie)</label>
              <textarea name="description" rows={4} defaultValue={ad?.description ?? ''}
                placeholder="Napisz coś o sobie, swoim doświadczeniu, czego szukasz..."
                className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm">Wynagrodzenie i dostępność</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Oczekiwana stawka</label>
                <input name="expectedSalary" type="number" min={0}
                  defaultValue={ad?.expectedSalary ?? ''} placeholder="np. 30"
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Typ stawki</label>
                <select name="salaryType" defaultValue={ad?.salaryType ?? 'hourly'}
                  className={`${inputClass} cursor-pointer`}>
                  <option value="hourly">Za godzinę</option>
                  <option value="daily">Za dzień</option>
                  <option value="monthly">Miesięcznie</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Dostępny od</label>
              <input name="availableFrom" type="date"
                defaultValue={ad?.availableFrom ? new Date(ad.availableFrom).toISOString().split('T')[0] : ''}
                className={inputClass} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" name="drivingLicense" defaultChecked={ad?.drivingLicense}
                className="w-4 h-4 accent-yellow-400" />
              <span className="text-sm font-medium text-slate-700">🚗 Posiadam prawo jazdy</span>
            </label>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-800 text-sm mb-4">Umiejętności</h2>
            <div className="flex gap-2 mb-3">
              <input type="text" value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="np. wózek widłowy, spawanie MIG..." className={inputClass} />
              <button type="button" onClick={addSkill}
                className="px-4 py-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold rounded-xl transition-all">
                +
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s} className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-sm rounded-lg">
                    {s}
                    <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))}
                      className="text-slate-400 hover:text-red-500 transition-colors">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-yellow-400/50 text-zinc-950 font-bold rounded-xl transition-all hover:scale-[1.01] disabled:scale-100">
            {saving ? 'Zapisywanie...' : ad ? '💾 Zaktualizuj ogłoszenie' : '📢 Opublikuj ogłoszenie'}
          </button>
        </form>

        <button onClick={() => router.push('/workers')}
          className="mt-4 w-full py-2.5 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
          ← Wróć do tablicy ogłoszeń
        </button>
      </div>
    </div>
  )
}
