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
  salaryMax?:     string
  remote?:         string
  drivingLicense?: string
  search?:         string
  sort?:           string
  external?:       string
  page?:           string
  view?:           string
  perPage?:        string
  extPage?:        string
  extLimit?:       string
}

interface Props { params: Params }

function FilterChevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      style={{ color: '#94a3b8' }}
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
  const [external,       setExternal]       = useState(params.external === 'true')

  const activeCount = [category, city, voivodeship, salaryMin, salaryMax, remote ? 'true' : '', drivingLicense ? 'true' : '', external ? 'true' : ''].filter(Boolean).length

  useEffect(() => {
    function onResize() {
      if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
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
      external:       external       ? 'true' : '',
      sort: sort || 'newest',
      ...overrides,
    }
    Object.entries(values).forEach(([k, v]) => { if (v) q.set(k, v) })
    const finalSort = overrides.sort ?? sort
    if (finalSort && finalSort !== 'newest') q.set('sort', finalSort)
    router.push(`${pathname}?${q.toString()}`)
  }, [category, city, radius, voivodeship, salaryMin, salaryMax, remote, drivingLicense, external, sort, params.search, pathname, router])

  function reset() {
    setCategory(''); setCity(''); setRadius(''); setVoivodeship('')
    setSalaryMin(''); setSalaryMax(''); setRemote(false); setDrivingLicense(false); setExternal(false); setSort('newest')
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    router.push(`${pathname}?${q.toString()}`)
  }

  const sectionClass = "glass-card p-4 sm:p-5 space-y-3"
  const labelClass   = "block text-xs font-semibold uppercase tracking-wider mb-2"
  const inputClass   = "w-full px-4 py-3 glass-inset rounded-xl text-sm outline-none transition-all"

  return (
    <div className="space-y-3 lg:sticky lg:top-24 z-30">

      <button
        type="button"
        className="lg:hidden w-full flex items-center justify-between gap-3 px-4 py-3 glass-card text-left touch-manipulation"
        onClick={() => setMobileExpanded(v => !v)}
        aria-expanded={mobileExpanded}
        aria-controls="offers-filters-panel"
      >
        <span className="flex items-center gap-2 font-bold text-sm" style={{ color: '#1a1a2e' }}>
          ⚙️ Filtry
          {activeCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: '#f97015' }}>
              {activeCount}
            </span>
          )}
        </span>
        <FilterChevron open={mobileExpanded} />
      </button>

      <div
        id="offers-filters-panel"
        className={`space-y-3 ${mobileExpanded ? '' : 'max-lg:hidden'} lg:block`}
      >

      {/* Nagłówek */}
      <div className="hidden lg:flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: '#1a1a2e' }}>Filtry</span>
          {activeCount > 0 && (
            <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: '#f97015' }}>
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={reset} className="text-xs transition-colors" style={{ color: '#94a3b8' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}>
            Wyczyść
          </button>
        )}
      </div>

      {/* Sortowanie */}
      <div className={sectionClass}>
        <label className={labelClass} style={{ color: '#f97015' }}>Sortowanie</label>
        <div className="space-y-2">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { setSort(opt.value); apply({ sort: opt.value, page: '1' }) }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all text-left ${
                sort === opt.value
                  ? 'font-semibold'
                  : 'font-medium'
              }`}
              style={sort === opt.value 
                ? { backgroundColor: 'rgba(249,112,21,0.1)', color: '#f97015', border: '1px solid rgba(249,112,21,0.2)' }
                : { color: '#64748b', backgroundColor: 'rgba(255,255,255,0.5)' }
              }>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Kategoria */}
      <div className={sectionClass}>
        <label className={labelClass} style={{ color: '#f97015' }}>Kategoria</label>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { const v = cat.value === category ? '' : cat.value; setCategory(v); apply({ category: v, page: '1' }) }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left ${
                category === cat.value
                  ? 'font-semibold'
                  : 'font-medium'
              }`}
              style={category === cat.value 
                ? { backgroundColor: 'rgba(249,112,21,0.1)', color: '#f97015', border: '1px solid rgba(249,112,21,0.2)' }
                : { color: '#64748b', backgroundColor: 'rgba(255,255,255,0.5)' }
              }>
              <span>{cat.icon}</span>
              <span className="truncate">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lokalizacja */}
      <div className={sectionClass}>
        <label className={labelClass} style={{ color: '#f97015' }}>Lokalizacja</label>
        <div className="space-y-3">
          <div>
            <p className="text-xs mb-1.5" style={{ color: '#94a3b8' }}>Województwo</p>
            <select value={voivodeship} onChange={e => setVoivodeship(e.target.value)} className={inputClass} style={{ color: '#1a1a2e' }}>
              <option value="">Wszystkie</option>
              {VOIVODESHIPS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs mb-1.5" style={{ color: '#94a3b8' }}>Miasto</p>
            <input type="text" value={city} onChange={e => setCity(e.target.value)}
              placeholder="np. Warszawa" className={inputClass} style={{ color: '#1a1a2e' }} />
          </div>
          <button onClick={() => apply({ page: '1' })}
            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all glass-button">
            Zastosuj
          </button>
        </div>
      </div>

      {/* Wynagrodzenie */}
      <div className={sectionClass}>
        <label className={labelClass} style={{ color: '#f97015' }}>Wynagrodzenie (zł)</label>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)}
              placeholder="Od" min={0} className={`${inputClass} text-center`} style={{ color: '#1a1a2e' }} />
            <span style={{ color: '#94a3b8' }}>—</span>
            <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)}
              placeholder="Do" min={0} className={`${inputClass} text-center`} style={{ color: '#1a1a2e' }} />
          </div>
          <button onClick={() => apply({ page: '1' })}
            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all glass-button">
            Zastosuj
          </button>
        </div>
      </div>

      {/* Tryb pracy */}
      <div className={sectionClass}>
        <label className={labelClass} style={{ color: '#f97015' }}>Tryb pracy</label>
        <div className="space-y-2">
          <button
            onClick={() => { setRemote(!remote); apply({ remote: !remote ? 'true' : '', page: '1' }) }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
              remote ? 'font-semibold' : 'font-medium'
            }`}
            style={remote 
              ? { backgroundColor: 'rgba(249,112,21,0.1)', color: '#f97015', border: '1px solid rgba(249,112,21,0.2)' }
              : { color: '#64748b', backgroundColor: 'rgba(255,255,255,0.5)' }
            }>
            <span className="flex items-center gap-2">
              <span>🏠</span>
              <span>Praca zdalna</span>
            </span>
            <div className={`w-11 h-6 rounded-full transition-all flex items-center px-0.5 ${remote ? '' : ''}`}
              style={{ backgroundColor: remote ? '#f97015' : '#e2e8f0' }}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all`} 
                style={{ transform: remote ? 'translateX(20px)' : 'translateX(0)' }} />
            </div>
          </button>

          <button
            onClick={() => { setDrivingLicense(!drivingLicense); apply({ drivingLicense: !drivingLicense ? 'true' : '', page: '1' }) }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
              drivingLicense ? 'font-semibold' : 'font-medium'
            }`}
            style={drivingLicense 
              ? { backgroundColor: 'rgba(249,112,21,0.1)', color: '#f97015', border: '1px solid rgba(249,112,21,0.2)' }
              : { color: '#64748b', backgroundColor: 'rgba(255,255,255,0.5)' }
            }>
            <span className="flex items-center gap-2">
              <span>🚗</span>
              <span>Wymaga prawa jazdy</span>
            </span>
            <div className={`w-11 h-6 rounded-full transition-all flex items-center px-0.5`}
              style={{ backgroundColor: drivingLicense ? '#f97015' : '#e2e8f0' }}>
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-all`} 
                style={{ transform: drivingLicense ? 'translateX(20px)' : 'translateX(0)' }} />
            </div>
          </button>
        </div>
      </div>

      {/* Źródło ofert */}
      <div className={sectionClass}>
        <label className={labelClass} style={{ color: '#f97015' }}>Źródło ofert</label>
        <button
          onClick={() => { setExternal(!external); apply({ external: !external ? 'true' : '', page: '1' }) }}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
            external ? 'font-semibold' : 'font-medium'
          }`}
          style={external 
            ? { backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }
            : { color: '#64748b', backgroundColor: 'rgba(255,255,255,0.5)' }
          }>
          <span className="flex items-center gap-2">
            <span>🌐</span>
            <span>Zewnętrzne (OLX)</span>
          </span>
          <div className={`w-11 h-6 rounded-full transition-all flex items-center px-0.5`}
            style={{ backgroundColor: external ? '#22c55e' : '#e2e8f0' }}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-all`} 
              style={{ transform: external ? 'translateX(20px)' : 'translateX(0)' }} />
          </div>
        </button>
      </div>

      </div>
    </div>
  )
}
