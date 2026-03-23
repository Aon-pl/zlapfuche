'use client'

import { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface Props {
  params: {
    city?:           string
    skill?:          string
    drivingLicense?: string
    minExp?:         string
  }
}

export default function WorkersFilters({ params }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  const [city,           setCity]           = useState(params.city           ?? '')
  const [skill,          setSkill]          = useState(params.skill          ?? '')
  const [drivingLicense, setDrivingLicense] = useState(params.drivingLicense === 'true')
  const [minExp,         setMinExp]         = useState(params.minExp         ?? '')

  const apply = useCallback((overrides: Record<string, string> = {}) => {
    const q = new URLSearchParams()
    const vals: Record<string, string> = {
      city, skill, drivingLicense: drivingLicense ? 'true' : '', minExp,
      ...overrides,
    }
    Object.entries(vals).forEach(([k, v]) => { if (v) q.set(k, v) })
    router.push(`${pathname}?${q.toString()}`)
  }, [city, skill, drivingLicense, minExp, pathname, router])

  function reset() {
    setCity(''); setSkill(''); setDrivingLicense(false); setMinExp('')
    router.push(pathname)
  }

  const active = [city, skill, drivingLicense ? 'x' : '', minExp].filter(Boolean).length

  const inputClass = "px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all"

  return (
    <div className="mt-5 flex flex-wrap gap-3 items-end">
      <div>
        <p className="text-xs text-slate-400 mb-1 font-medium">Miasto</p>
        <input type="text" value={city} onChange={e => setCity(e.target.value)}
          placeholder="np. Warszawa" className={inputClass} />
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-1 font-medium">Umiejętność</p>
        <input type="text" value={skill} onChange={e => setSkill(e.target.value)}
          placeholder="np. wózek widłowy" className={inputClass} />
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-1 font-medium">Min. doświadczenie</p>
        <select value={minExp} onChange={e => setMinExp(e.target.value)}
          className={`${inputClass} cursor-pointer`}>
          <option value="">Dowolne</option>
          <option value="1">1+ rok</option>
          <option value="2">2+ lata</option>
          <option value="5">5+ lat</option>
        </select>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none pb-0.5">
        <div className={`w-10 h-5.5 rounded-full transition-all flex items-center px-0.5 ${drivingLicense ? 'bg-yellow-400' : 'bg-slate-200'}`}
          style={{ height: 22 }}>
          <div className={`w-4 h-4 rounded-full bg-white shadow transition-all ${drivingLicense ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <input type="checkbox" checked={drivingLicense}
          onChange={e => setDrivingLicense(e.target.checked)} className="sr-only" />
        <span className="text-sm text-slate-600 font-medium">🚗 Prawo jazdy</span>
      </label>

      <button onClick={() => apply({})}
        className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold rounded-xl text-sm transition-all hover:scale-105">
        Szukaj
      </button>

      {active > 0 && (
        <button onClick={reset}
          className="px-4 py-2.5 text-slate-500 hover:text-red-500 text-sm font-medium transition-colors">
          Wyczyść ({active})
        </button>
      )}
    </div>
  )
}
