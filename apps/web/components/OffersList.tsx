'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import Pagination from '@/components/Pagination'

const CATEGORY_LABELS: Record<string, string> = {
  warehouse: 'Magazyn', construction: 'Budowlanka', hospitality: 'Gastronomia',
  transport: 'Transport', retail: 'Handel', manufacturing: 'Produkcja',
  cleaning: 'Sprzątanie', agriculture: 'Rolnictwo', office: 'Biuro', other: 'Inne',
}

const CATEGORY_ICONS: Record<string, string> = {
  warehouse: '📦', construction: '🏗️', hospitality: '🍽️', transport: '🚛',
  retail: '🛒', manufacturing: '⚙️', cleaning: '🧹', agriculture: '🌾',
  office: '💼', other: '🔧',
}

const SALARY_TYPES: Record<string, string> = {
  hourly: 'h', daily: 'dzień', monthly: 'mies.',
}

const SORT_LABELS: Record<string, string> = {
  newest:      '🕐 Najnowsze',
  salary_desc: '💰 Najwyższe wynagrodzenie',
  popular:     '🔥 Najpopularniejsze',
}

interface Offer {
  id: string
  title: string
  category: string
  city: string
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string
  remote: boolean
  drivingLicense: boolean
  createdAt: Date
  applicationsCount: number
  company?: { companyName: string } | null
  person?:  { firstName: string; lastName: string } | null
}

interface Props {
  offers:      Offer[]
  total:       number
  pages:       number
  currentPage: number
  params:      Record<string, string | undefined>
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'dzisiaj'
  if (days === 1) return 'wczoraj'
  if (days < 7)  return `${days} dni temu`
  if (days < 30) return `${Math.floor(days / 7)} tyg. temu`
  return `${Math.floor(days / 30)} mies. temu`
}

export default function OffersList({ offers, total, pages, currentPage, params }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  const hasFilters = Object.entries(params)
    .filter(([k]) => k !== 'search' && k !== 'page' && k !== 'sort')
    .some(([, v]) => v)

  function changeSort(sort: string) {
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v && k !== 'sort' && k !== 'page') q.set(k, v) })
    if (sort && sort !== 'newest') q.set('sort', sort)
    router.push(`${pathname}?${q.toString()}`)
  }

  const currentSort = params.sort ?? 'newest'
  const start = (currentPage - 1) * 20 + 1
  const end   = Math.min(currentPage * 20, total)

  return (
    <div>
      {/* Pasek info + sortowanie */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {total === 0 ? 'Brak wyników' : (
            <>
              <span className="font-bold text-slate-800">{start}–{end}</span>
              {' '}z{' '}
              <span className="font-bold text-slate-800">{total}</span> ofert
            </>
          )}
          {hasFilters && <span className="text-yellow-600 ml-2">· filtrowane</span>}
        </p>
        <select
          value={currentSort}
          onChange={e => changeSort(e.target.value)}
          className="bg-white border border-slate-200 text-slate-600 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-yellow-400 transition-all shadow-sm cursor-pointer"
        >
          {Object.entries(SORT_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Brak ofert</h3>
          <p className="text-slate-400 text-sm max-w-sm">Spróbuj zmienić filtry lub wróć później.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {offers.map(offer => {
              const authorName = offer.company?.companyName
                ?? (offer.person ? `${offer.person.firstName} ${offer.person.lastName}` : '')

              const salaryLabel = offer.salaryMin
                ? `${offer.salaryMin}${offer.salaryMax ? `–${offer.salaryMax}` : '+'} zł/${SALARY_TYPES[offer.salaryType] ?? 'h'}`
                : null

              return (
                <Link key={offer.id} href={`/offers/${offer.id}`}
                  className="flex items-center gap-4 px-5 py-4 bg-white border border-slate-200 hover:border-yellow-400/60 hover:shadow-md rounded-xl transition-all group">

                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg flex-shrink-0 group-hover:bg-yellow-400/10 group-hover:border-yellow-400/30 transition-all">
                    {CATEGORY_ICONS[offer.category] ?? '🔧'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 truncate group-hover:text-yellow-700 transition-colors">
                        {offer.title}
                      </h3>
                      {offer.remote && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-semibold rounded-full">
                          Zdalna
                        </span>
                      )}
                      {offer.drivingLicense && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-semibold rounded-full">
                          🚗 Prawo jazdy
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                      <span>{authorName}</span>
                      <span>·</span>
                      <span>📍 {offer.city}</span>
                      <span>·</span>
                      <span>{CATEGORY_LABELS[offer.category] ?? offer.category}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {salaryLabel && (
                      <span className="text-sm font-bold text-yellow-600">{salaryLabel}</span>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {offer.applicationsCount > 0 && (
                        <span>{offer.applicationsCount} aplikacji</span>
                      )}
                      <span>{timeAgo(offer.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Paginacja */}
          <Pagination currentPage={currentPage} totalPages={pages} params={params} />
        </>
      )}
    </div>
  )
}
