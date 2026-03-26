'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import OffersMap from '@/components/OffersMap'
import OfferPreviewModal from '@/components/OfferPreviewModal'

type ViewMode = 'list' | 'grid' | 'map'

const CATEGORY_LABELS: Record<string, string> = {
  warehouse: '📦 Magazyn', construction: '🏗️ Budowlanka',
  hospitality: '🍽️ Gastronomia', transport: '🚛 Transport',
  retail: '🛒 Handel', manufacturing: '⚙️ Produkcja',
  cleaning: '🧹 Sprzątanie', agriculture: '🌾 Rolnictwo',
  office: '💼 Biuro', other: '🔧 Inne',
}
const SALARY_TYPE: Record<string, string> = { hourly: 'godz.', daily: 'dzień', monthly: 'mies.' }

interface Offer {
  id: string
  title: string
  city: string
  category: string
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string
  remote: boolean
  drivingLicense: boolean
  createdAt: Date | string
  applicationsCount: number
  lat?: number | null
  lng?: number | null
  postalCode?: string | null
  company?: { id: string; companyName: string; companyLogoUrl: string | null } | null
  person?:  { id: string; firstName: string; lastName: string } | null
}

interface Props {
  offers:      Offer[]
  total:       number
  pages:       number
  currentPage: number
  params:      Record<string, string | undefined>
  initialView: ViewMode
}

export default function OffersClientWrapper({ offers, total, pages, currentPage, params, initialView }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const [view,        setView]        = useState<ViewMode>(initialView)
  const [previewId,   setPreviewId]   = useState<string | null>(null)

  function switchView(v: ViewMode) {
    setView(v)
    const q = new URLSearchParams()
    Object.entries({ ...params, view: v }).forEach(([k, val]) => { if (val) q.set(k, val) })
    router.replace(`${pathname}?${q.toString()}`, { scroll: false })
  }

  const card = 'bg-white border border-gray-100 hover:border-orange-200 hover:shadow-md rounded-2xl transition-all group shadow-sm'

  const OfferCard = ({ offer, grid = false }: { offer: Offer; grid?: boolean }) => {
    const author = offer.company?.companyName
      ?? (offer.person ? `${offer.person.firstName} ${offer.person.lastName}` : '')
    const salary = offer.salaryMin
      ? `${offer.salaryMin}${offer.salaryMax ? `–${offer.salaryMax}` : '+'} zł/${SALARY_TYPE[offer.salaryType]}`
      : null

    if (grid) return (
      <Link href={`/offers/${offer.id}`} className={`${card} p-4 flex flex-col gap-3 relative overflow-hidden max-md:pb-3`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 overflow-hidden text-sm"
            style={{ background: '#f97015' }}>
            {offer.company?.companyLogoUrl
              ? <img src={offer.company.companyLogoUrl} alt={author} className="w-full h-full object-cover" />
              : author[0]
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors text-sm line-clamp-2 leading-snug">{offer.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{author}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(249,112,21,0.08)', color: '#f97015' }}>
            {CATEGORY_LABELS[offer.category]}
          </span>
          {offer.remote && <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">🏠 Zdalna</span>}
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
          <p className="text-xs text-gray-500">📍 {offer.city}</p>
          {salary && <p className="text-sm font-black" style={{ color: '#f97015' }}>{salary}</p>}
        </div>

        <div
          className="hidden md:flex absolute inset-0 items-end p-3 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.97) 60%, transparent)' }}
        >
          <span className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-white transition-all"
            style={{ background: '#f97015' }}>
            Sprawdź ofertę
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setPreviewId(offer.id) }}
            className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all bg-white pointer-events-auto"
            style={{ borderColor: '#f97015', color: '#f97015' }}>
            Podgląd oferty
          </button>
        </div>
        <div className="flex md:hidden gap-2 mt-1">
          <span className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white"
            style={{ background: '#f97015' }}>
            Otwórz ofertę
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setPreviewId(offer.id) }}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border bg-white touch-manipulation"
            style={{ borderColor: '#f97015', color: '#f97015' }}>
            Podgląd
          </button>
        </div>
      </Link>
    )

    // Widok lista
    return (
      <Link href={`/offers/${offer.id}`} className={`${card} p-4 sm:p-5 flex flex-col gap-4 md:flex-row md:items-start relative overflow-hidden`}>
        <div className="flex flex-1 items-start gap-4 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white shrink-0 overflow-hidden"
            style={{ background: '#f97015' }}>
            {offer.company?.companyLogoUrl
              ? <img src={offer.company.companyLogoUrl} alt={author} className="w-full h-full object-cover" />
              : author[0]
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors text-sm sm:text-base">{offer.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{author} · 📍 {offer.city}</p>
              </div>
              {salary && <p className="font-black shrink-0 text-sm sm:text-base" style={{ color: '#f97015' }}>{salary}</p>}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(249,112,21,0.08)', color: '#f97015' }}>
                {CATEGORY_LABELS[offer.category]}
              </span>
              {offer.remote        && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">🏠 Zdalna</span>}
              {offer.drivingLicense && <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">🚗 Prawo jazdy</span>}
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                {offer.applicationsCount} aplikacji
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <span className="text-xs font-bold px-4 py-2 rounded-xl text-white whitespace-nowrap"
            style={{ background: '#f97015' }}>
            Sprawdź ofertę
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setPreviewId(offer.id) }}
            className="text-xs font-bold px-4 py-2 rounded-xl border bg-white whitespace-nowrap transition-all"
            style={{ borderColor: '#f97015', color: '#f97015' }}>
            Podgląd oferty
          </button>
        </div>

        <div className="flex md:hidden gap-2 w-full pt-3 border-t border-gray-50 -mt-1">
          <span className="flex-1 text-center py-2.5 rounded-xl text-xs font-bold text-white touch-manipulation"
            style={{ background: '#f97015' }}>
            Szczegóły oferty
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setPreviewId(offer.id) }}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border bg-white touch-manipulation"
            style={{ borderColor: '#f97015', color: '#f97015' }}>
            Podgląd
          </button>
        </div>
      </Link>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {total > 0
            ? `${(currentPage - 1) * 20 + 1}–${Math.min(currentPage * 20, total)} z ${total} ofert`
            : 'Brak ofert'}
        </p>

        {/* Przełącznik widoku */}
        <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
          {([
            ['list', '☰', 'Lista'],
            ['grid', '⊞', 'Siatka'],
            ['map',  '🗺', 'Mapa'],
          ] as [ViewMode, string, string][]).map(([v, icon, label]) => (
            <button key={v} onClick={() => switchView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === v ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}
              style={view === v ? { background: '#f97015' } : {}}>
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WIDOK LISTA */}
      {view === 'list' && (
        offers.length === 0
          ? <EmptyState />
          : <div className="space-y-3">
              {offers.map(o => <OfferCard key={o.id} offer={o} />)}
            </div>
      )}

      {/* WIDOK SIATKA */}
      {view === 'grid' && (
        offers.length === 0
          ? <EmptyState />
          : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {offers.map(o => <OfferCard key={o.id} offer={o} grid />)}
            </div>
      )}

      {/* WIDOK MAPA */}
      {view === 'map' && (
        <div
          className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm min-h-[280px] h-[min(560px,65dvh)] md:h-[560px]"
        >
          <OffersMap offers={offers} />
        </div>
      )}

      {/* Paginacja */}
      {pages > 1 && view !== 'map' && (
        <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
          {currentPage > 1 && (
            <Link href={`${pathname}?${new URLSearchParams({ ...params, page: String(currentPage - 1) }).toString()}`}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:border-orange-300 transition-all">
              ←
            </Link>
          )}
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            const p = pages <= 7 ? i + 1 : currentPage <= 4 ? i + 1 : currentPage + i - 3
            if (p < 1 || p > pages) return null
            return (
              <Link key={p}
                href={`${pathname}?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  p === currentPage ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
                style={p === currentPage ? { background: '#f97015' } : {}}>
                {p}
              </Link>
            )
          })}
          {currentPage < pages && (
            <Link href={`${pathname}?${new URLSearchParams({ ...params, page: String(currentPage + 1) }).toString()}`}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold bg-white border border-gray-200 text-gray-600 hover:border-orange-300 transition-all">
              →
            </Link>
          )}
        </div>
      )}

      {/* Modal podglądu */}
      {previewId && (
        <OfferPreviewModal offerId={previewId} onClose={() => setPreviewId(null)} />
      )}
    </>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
      <p className="text-5xl mb-3">🔍</p>
      <p className="font-bold text-gray-900 mb-1">Brak ofert</p>
      <p className="text-sm text-gray-500">Spróbuj zmienić filtry lub wyszukiwanie</p>
    </div>
  )
}
