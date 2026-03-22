'use client'

import { useRouter, usePathname } from 'next/navigation'

interface Props {
  currentPage: number
  totalPages:  number
  params:      Record<string, string | undefined>
}

export default function Pagination({ currentPage, totalPages, params }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  if (totalPages <= 1) return null

  function goTo(page: number) {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v && k !== 'page') q.set(k, v) })
    if (page > 1) q.set('page', String(page))
    router.push(`${pathname}?${q.toString()}`)
  }

  // Generuj zakres stron do pokazania
  const delta = 2
  const range: (number | '...')[] = []
  const rangeStart = Math.max(2, currentPage - delta)
  const rangeEnd   = Math.min(totalPages - 1, currentPage + delta)

  range.push(1)
  if (rangeStart > 2) range.push('...')
  for (let i = rangeStart; i <= rangeEnd; i++) range.push(i)
  if (rangeEnd < totalPages - 1) range.push('...')
  if (totalPages > 1) range.push(totalPages)

  const btnBase = "min-w-[36px] h-9 px-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center"

  return (
    <div className="flex items-center justify-center gap-1 mt-8">

      {/* Poprzednia */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} ${
          currentPage === 1
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-600 hover:bg-slate-100 border border-slate-200 bg-white'
        }`}
      >
        ←
      </button>

      {/* Numery stron */}
      {range.map((item, i) =>
        item === '...' ? (
          <span key={`dots-${i}`} className="min-w-[36px] h-9 flex items-center justify-center text-slate-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => goTo(item as number)}
            className={`${btnBase} ${
              currentPage === item
                ? 'bg-yellow-400 text-zinc-950 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        )
      )}

      {/* Następna */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} ${
          currentPage === totalPages
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-600 hover:bg-slate-100 border border-slate-200 bg-white'
        }`}
      >
        →
      </button>
    </div>
  )
}
