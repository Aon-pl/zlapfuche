'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'

const CATEGORIES = [
  { value: 'warehouse',     label: 'Magazyn',     icon: '📦' },
  { value: 'construction',  label: 'Budowlanka',  icon: '🏗️' },
  { value: 'hospitality',   label: 'Gastronomia', icon: '🍽️' },
  { value: 'transport',     label: 'Transport',   icon: '🚛' },
  { value: 'retail',        label: 'Handel',      icon: '🛒' },
  { value: 'manufacturing', label: 'Produkcja',   icon: '⚙️' },
  { value: 'cleaning',      label: 'Sprzątanie',  icon: '🧹' },
  { value: 'agriculture',   label: 'Rolnictwo',   icon: '🌾' },
  { value: 'office',        label: 'Biuro',       icon: '💼' },
  { value: 'other',         label: 'Inne',        icon: '🔧' },
]

const VOIVODESHIPS = [
  'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie',
  'łódzkie', 'małopolskie', 'mazowieckie', 'opolskie',
  'podkarpackie', 'podlaskie', 'pomorskie', 'śląskie',
  'świętokrzyskie', 'warmińsko-mazurskie', 'wielkopolskie', 'zachodniopomorskie',
]

const SORT_OPTIONS = [
  { value: 'newest',      label: '🕐 Najnowsze'           },
  { value: 'salary_desc', label: '💰 Najwyższe wynagrodzenie' },
  { value: 'popular',     label: '🔥 Najpopularniejsze'   },
]

interface Params {
  category?:       string
  city?:           string
  voivodeship?:    string
  radius?:         string
  salaryMin?:      string
  salaryMax?:      string
  remote?:         string
  drivingLicense?: string
  search?:         string
  sort?:           string
}

interface Props { params: Params }

function FilterChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function OffersFilters({ params }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  const [mobileExpanded, setMobileExpanded] = useState(false)

  const [category,    setCategory]    = useState(params.category    ?? '')
  const [city,        setCity]        = useState(params.city        ?? '')
  const [radius,      setRadius]      = useState(params.radius      ?? '')
  const [voivodeship, setVoivodeship] = useState(params.voivodeship ?? '')
  const [salaryMin,   setSalaryMin]   = useState(params.salaryMin   ?? '')
  const [salaryMax,   setSalaryMax]   = useState(params.salaryMax   ?? '')
  const [remote,         setRemote]         = useState(params.remote === 'true')
  const [drivingLicense, setDrivingLicense] = useState(params.drivingLicense === 'true')
  const [sort,           setSort]           = useState(params.sort ?? 'newest')

  const activeCount = [category, city, voivodeship, salaryMin, salaryMax, remote ? 'true' : '', drivingLicense ? 'true' : ''].filter(Boolean).length

  useEffect(() => {
    function onResize() {
      if (typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches) {
        setMobileExpanded(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const apply = useCallback((overrides: Partial<Record<keyof Params, string>> = {}) => {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    const values: Record<string, string> = {
      category, city, radius: city ? radius : '', voivodeship,
      salaryMin, salaryMax,
      remote:         remote         ? 'true' : '',
      drivingLicense: drivingLicense ? 'true' : '',
      sort: sort || 'newest',
      ...overrides,
    }
    Object.entries(values).forEach(([k, v]) => { if (v) q.set(k, v) })
    const finalSort = overrides.sort ?? sort
    if (finalSort && finalSort !== 'newest') q.set('sort', finalSort)
    router.push(`${pathname}?${q.toString()}`)
  }, [category, city, radius, voivodeship, salaryMin, salaryMax, remote, drivingLicense, sort, params.search, pathname, router])

  function reset() {
    setCategory(''); setCity(''); setRadius(''); setVoivodeship('')
    setSalaryMin(''); setSalaryMax(''); setRemote(false); setDrivingLicense(false); setSort('newest')
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    router.push(`${pathname}?${q.toString()}`)
  }

  const sectionClass = "bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm"
  const labelClass   = "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3"
  const inputClass   = "w-full px-3 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all"

  return (
    <div className="space-y-3 md:sticky md:top-20 z-30">

      <button
        type="button"
        className="md:hidden w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm text-left touch-manipulation"
        onClick={() => setMobileExpanded(v => !v)}
        aria-expanded={mobileExpanded}
        aria-controls="offers-filters-panel"
      >
        <span className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          Filtry
          {activeCount > 0 && (
            <span className="min-w-6 h-6 px-1.5 inline-flex items-center justify-center bg-yellow-400 text-zinc-950 text-xs font-black rounded-full">
              {activeCount}
            </span>
          )}
        </span>
        <FilterChevron open={mobileExpanded} />
      </button>

      <div
        id="offers-filters-panel"
        className={`space-y-3 ${mobileExpanded ? '' : 'max-md:hidden'} md:block`}
      >

      {/* Nagłówek */}
      <div className="hidden md:flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-slate-800 font-bold text-sm">Filtry</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 bg-yellow-400 text-zinc-950 text-xs font-black rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
            Wyczyść
          </button>
        )}
      </div>

      <div className="md:hidden flex items-center justify-between px-1 pt-1 pb-0.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Szczegóły filtrów</span>
        {activeCount > 0 && (
          <button type="button" onClick={reset} className="text-xs text-slate-400 hover:text-red-500 transition-colors touch-manipulation py-2">
            Wyczyść
          </button>
        )}
      </div>

      {/* Sortowanie */}
      <div className={sectionClass}>
        <label className={labelClass}>Sortowanie</label>
        <div className="space-y-1">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSort(opt.value); apply({ sort: opt.value }) }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                sort === opt.value
                  ? 'bg-yellow-400/10 border border-yellow-400/40 text-yellow-700 font-semibold'
                  : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kategoria */}
      <div className={sectionClass}>
        <label className={labelClass}>Kategoria</label>
        <div className="space-y-0.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { const v = cat.value === category ? '' : cat.value; setCategory(v); apply({ category: v }) }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                category === cat.value
                  ? 'bg-yellow-400/10 border border-yellow-400/40 text-yellow-700 font-semibold'
                  : 'hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lokalizacja */}
      <div className={sectionClass}>
        <label className={labelClass}>Lokalizacja</label>
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Województwo</p>
          <select value={voivodeship} onChange={e => setVoivodeship(e.target.value)} className={inputClass}>
            <option value="">Wszystkie</option>
            {VOIVODESHIPS.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Miasto</p>
          <input type="text" value={city} onChange={e => setCity(e.target.value)}
            placeholder="np. Warszawa" className={inputClass} />
        </div>
        <button onClick={() => apply({})}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-sm rounded-xl transition-all font-medium">
          Zastosuj lokalizację
        </button>
      </div>

      {/* Wynagrodzenie */}
      <div className={sectionClass}>
        <label className={labelClass}>Wynagrodzenie (zł)</label>
        <div className="flex items-center gap-2">
          <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)}
            placeholder="Od" min={0} className={inputClass} />
          <span className="text-slate-300 flex-shrink-0">—</span>
          <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)}
            placeholder="Do" min={0} className={inputClass} />
        </div>
        <button onClick={() => apply({})}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-sm rounded-xl transition-all font-medium">
          Zastosuj
        </button>
      </div>

      {/* Tryb pracy */}
      <div className={sectionClass}>
        <label className={labelClass}>Tryb pracy i wymagania</label>
        <button
          onClick={() => { setRemote(!remote); apply({ remote: !remote ? 'true' : '' }) }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
            remote
              ? 'border-yellow-400 bg-yellow-400/10 text-yellow-700 font-semibold'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🏠</span>
            <span>Praca zdalna</span>
          </span>
          <div className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${remote ? 'bg-yellow-400' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${remote ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>

        <button
          onClick={() => { setDrivingLicense(!drivingLicense); apply({ drivingLicense: !drivingLicense ? 'true' : '' }) }}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
            drivingLicense
              ? 'border-yellow-400 bg-yellow-400/10 text-yellow-700 font-semibold'
              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🚗</span>
            <span>Wymaga prawa jazdy</span>
          </span>
          <div className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${drivingLicense ? 'bg-yellow-400' : 'bg-slate-200'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${drivingLicense ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>

      </div>
    </div>
  )
}
