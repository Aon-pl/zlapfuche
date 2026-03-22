'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface Props {
  params: {
    city?:      string
    minRating?: string
    sort?:      string
  }
  sortOptions: Record<string, string>
}

export default function RankingFilters({ params, sortOptions }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  const [city,      setCity]      = useState(params.city      ?? '')
  const [minRating, setMinRating] = useState(params.minRating ?? '')
  const [sort,      setSort]      = useState(params.sort      ?? 'rating_desc')

  function apply() {
    const q = new URLSearchParams()
    if (city)      q.set('city',      city)
    if (minRating) q.set('minRating', minRating)
    if (sort && sort !== 'rating_desc') q.set('sort', sort)
    router.push(`${pathname}?${q.toString()}`)
  }

  function reset() {
    setCity(''); setMinRating(''); setSort('rating_desc')
    router.push(pathname)
  }

  const active = [city, minRating].filter(Boolean).length
  const inputClass = "px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all"

  return (
    <div className="mt-5 flex flex-wrap gap-3 items-end">

      <div>
        <p className="text-xs text-slate-400 mb-1 font-medium">Miasto</p>
        <input type="text" value={city} onChange={e => setCity(e.target.value)}
          placeholder="np. Warszawa" className={inputClass} />
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-1 font-medium">Min. ocena</p>
        <select value={minRating} onChange={e => setMinRating(e.target.value)}
          className={`${inputClass} cursor-pointer`}>
          <option value="">Dowolna</option>
          <option value="3">3+ ⭐</option>
          <option value="4">4+ ⭐</option>
          <option value="4.5">4.5+ ⭐</option>
        </select>
      </div>

      <div>
        <p className="text-xs text-slate-400 mb-1 font-medium">Sortuj</p>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className={`${inputClass} cursor-pointer`}>
          {Object.entries(sortOptions).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      <button onClick={apply}
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
