'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import OffersMap from '@/components/OffersMap'
import OfferPreviewModal from '@/components/OfferPreviewModal'
import ExternalOfferPreviewModal from '@/components/ExternalOfferPreviewModal'

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

interface ExternalOffer {
  id: string
  isExternal: true
  source: string
  externalUrl: string
  title: string
  description: string | null
  city: string | null
  salary: string | null
  createdAt: Date
  location: string | null
  work_time: string | null
}

interface Props {
  offers:          Offer[]
  total:           number
  totalInternal:   number
  pages:           number
  currentPage:     number
  params:          Record<string, string | undefined>
  initialView:     ViewMode
  externalOffers?: ExternalOffer[]
  showExternal?: boolean
  perPage?: number
}

export default function OffersClientWrapper({ offers, total, totalInternal, pages, currentPage, params, initialView, externalOffers = [], showExternal = false, perPage = 20 }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const [view,        setView]        = useState<ViewMode>(initialView)
  const [previewId,   setPreviewId]   = useState<string | null>(null)
  const [previewExternal, setPreviewExternal] = useState<ExternalOffer | null>(null)

  const handleOpenPreview = useCallback((id: string) => {
    const extOffer = externalOffers.find(o => o.id === id)
    if (extOffer) {
      setPreviewExternal(extOffer)
    } else {
      setPreviewId(id)
    }
  }, [externalOffers])

  const handleClosePreview = useCallback(() => {
    setPreviewId(null)
    setPreviewExternal(null)
  }, [])

  function switchView(v: ViewMode) {
    setView(v)
    const q = new URLSearchParams()
    Object.entries({ ...params, view: v, page: '1' }).forEach(([k, val]) => { if (val) q.set(k, val) })
    router.replace(`${pathname}?${q.toString()}`, { scroll: false })
  }

  const card = 'glass-card p-5 transition-all group'
  const cardExternal = 'glass-card p-5 transition-all group'

  const OfferCard = ({ offer, grid = false }: { offer: Offer; grid?: boolean }) => {
    const author = offer.company?.companyName
      ?? (offer.person ? `${offer.person.firstName} ${offer.person.lastName}` : '')
    const salary = offer.salaryMin
      ? `${offer.salaryMin}${offer.salaryMax ? `–${offer.salaryMax}` : '+'} zł/${SALARY_TYPE[offer.salaryType]}`
      : null

    if (grid) return (
      <Link href={`/offers/${offer.id}`} className={`${card} flex flex-col gap-3 relative overflow-hidden hover:scale-[1.02]`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #f97015 0%, #ea6c00 100%)', color: 'white' }}>
            {offer.company?.companyLogoUrl
              ? <img src={offer.company.companyLogoUrl} alt={author} className="w-full h-full object-cover rounded-xl" />
              : author[0]
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold line-clamp-2 leading-snug" style={{ color: '#1a1a2e' }}>{offer.title}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#94a3b8' }}>{author}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: 'rgba(249,112,21,0.1)', color: '#f97015' }}>
            {CATEGORY_LABELS[offer.category]}
          </span>
          {offer.remote && <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium">🏠</span>}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>📍 {offer.city}</p>
          {salary && <p className="text-sm font-bold" style={{ color: '#f97015' }}>{salary}</p>}
        </div>
        
        {/* Hover buttons */}
        <div className="hidden lg:flex absolute inset-0 items-end p-3 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.97) 60%, transparent)' }}>
          <span className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: '#f97015' }}>
            Sprawdź szczegóły
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setPreviewId(offer.id) }}
            className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all bg-white"
            style={{ borderColor: '#f97015', color: '#f97015' }}>
            Podgląd
          </button>
        </div>
      </Link>
    )

    return (
      <Link href={`/offers/${offer.id}`} className={`${card} flex flex-col gap-4 relative overflow-hidden hover:scale-[1.01]`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #f97015 0%, #ea6c00 100%)', color: 'white' }}>
            {offer.company?.companyLogoUrl
              ? <img src={offer.company.companyLogoUrl} alt={author} className="w-full h-full object-cover rounded-xl" />
              : author[0]
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="font-bold" style={{ color: '#1a1a2e' }}>{offer.title}</p>
                <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>{author} · 📍 {offer.city}</p>
              </div>
              {salary && <p className="font-bold shrink-0" style={{ color: '#f97015' }}>{salary}</p>}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ backgroundColor: 'rgba(249,112,21,0.1)', color: '#f97015' }}>
                {CATEGORY_LABELS[offer.category]}
              </span>
              {offer.remote        && <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium">🏠 Zdalna</span>}
              {offer.drivingLicense && <span className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#64748b' }}>🚗</span>}
              <span className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#64748b' }}>
                {offer.applicationsCount} apl.
              </span>
            </div>
          </div>
        </div>
        
        {/* Hover buttons */}
        <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <span className="text-xs font-bold px-4 py-2 rounded-xl text-white whitespace-nowrap"
            style={{ background: '#f97015' }}>
            Sprawdź szczegóły
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setPreviewId(offer.id) }}
            className="text-xs font-bold px-4 py-2 rounded-xl border bg-white whitespace-nowrap transition-all"
            style={{ borderColor: '#f97015', color: '#f97015' }}>
            Podgląd
          </button>
        </div>
      </Link>
    )
  }

  const ExternalOfferCard = ({ offer, grid = false }: { offer: ExternalOffer; grid?: boolean }) => {
    const salary = offer.salary

    if (grid) return (
      <a href={offer.externalUrl} target="_blank" rel="noopener noreferrer" className={`${cardExternal} flex flex-col gap-3 relative overflow-hidden hover:scale-[1.02]`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-green-100">
            🌐
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-lg font-semibold bg-green-100 text-green-700">{offer.source}</span>
            </div>
            <p className="font-bold line-clamp-2 leading-snug" style={{ color: '#1a1a2e' }}>{offer.title}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#94a3b8' }}>{offer.location || offer.city}</p>
          </div>
        </div>
        {offer.work_time && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#64748b' }}>{offer.work_time}</span>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>📍 {offer.location || offer.city}</p>
          {salary && <p className="text-sm font-bold" style={{ color: '#22c55e' }}>{salary}</p>}
        </div>
        
        {/* Hover buttons */}
        <div className="hidden lg:flex absolute inset-0 items-end p-3 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.97) 60%, transparent)' }}>
          <span className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-white"
            style={{ background: '#22c55e' }}>
            Zobacz szczegóły
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); handleOpenPreview(offer.id) }}
            className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all bg-white"
            style={{ borderColor: '#22c55e', color: '#22c55e' }}>
            Podgląd
          </button>
        </div>
      </a>
    )

    return (
      <a href={offer.externalUrl} target="_blank" rel="noopener noreferrer" className={`${cardExternal} flex flex-col gap-4 relative overflow-hidden hover:scale-[1.01]`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg shrink-0 bg-green-100">
            🌐
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-green-100 text-green-700">{offer.source}</span>
            </div>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <p className="font-bold" style={{ color: '#1a1a2e' }}>{offer.title}</p>
              {salary && <p className="font-bold shrink-0" style={{ color: '#22c55e' }}>{salary}</p>}
            </div>
            <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>📍 {offer.location || offer.city}</p>
            {offer.work_time && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-xs px-2.5 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: '#64748b' }}>{offer.work_time}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Hover buttons */}
        <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
          <span className="text-xs font-bold px-4 py-2 rounded-xl text-white whitespace-nowrap"
            style={{ background: '#22c55e' }}>
            Zobacz szczegóły
          </span>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); handleOpenPreview(offer.id) }}
            className="text-xs font-bold px-4 py-2 rounded-xl border bg-white whitespace-nowrap transition-all"
            style={{ borderColor: '#22c55e', color: '#22c55e' }}>
            Podgląd
          </button>
        </div>
      </a>
    )
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <p className="text-sm" style={{ color: '#64748b' }}>
          {(offers.length > 0 || externalOffers.length > 0)
            ? `${(currentPage - 1) * perPage + 1}–${Math.min(currentPage * perPage, total)} z ${total.toLocaleString('pl-PL')} ofert`
            : 'Brak ofert'}
        </p>

        {/* Przełącznik widoku */}
        <div className="flex items-center gap-1 p-1 glass-card rounded-xl">
          {([
            ['list', '☰', 'Lista'],
            ['grid', '⊞', 'Siatka'],
            ['map',  '🗺', 'Mapa'],
          ] as [ViewMode, string, string][]).map(([v, icon, label]) => (
            <button key={v} onClick={() => switchView(v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === v ? '' : ''
              }`}
              style={view === v 
                ? { background: 'linear-gradient(135deg, #f97015 0%, #ea6c00 100%)', color: 'white', boxShadow: '0 4px 12px rgba(249,112,21,0.3)' }
                : { color: '#64748b' }
              }>
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WIDOK LISTA */}
      {view === 'list' && (
        offers.length === 0 && externalOffers.length === 0
          ? <EmptyState />
          : <div className="space-y-3">
              {offers.map(o => <OfferCard key={o.id} offer={o} />)}
              {externalOffers.map(o => <ExternalOfferCard key={o.id} offer={o} />)}
            </div>
      )}

      {/* WIDOK SIATKA */}
      {view === 'grid' && (
        offers.length === 0 && externalOffers.length === 0
          ? <EmptyState />
          : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {offers.map(o => <OfferCard key={o.id} offer={o} grid />)}
              {externalOffers.map(o => <ExternalOfferCard key={o.id} offer={o} grid />)}
            </div>
      )}

      {/* WIDOK MAPA */}
      {view === 'map' && (
        <div className="glass-card overflow-hidden min-h-[400px] h-[60vh]">
          <OffersMap offers={offers} />
        </div>
      )}

      {/* Pagination */}
      {view !== 'map' && (
        <UnifiedPagination
          total={total}
          pages={pages}
          currentPage={currentPage}
          params={params}
          pathname={pathname}
          perPage={perPage}
        />
      )}

      {/* Modal podglądu */}
      {previewId && (
        <OfferPreviewModal offerId={previewId} onClose={handleClosePreview} />
      )}
      {previewExternal && (
        <ExternalOfferPreviewModal offer={previewExternal} onClose={handleClosePreview} />
      )}
    </>
  )
}

function UnifiedPagination({
  total,
  pages,
  currentPage,
  params,
  pathname,
  perPage
}: {
  total: number
  pages: number
  currentPage: number
  params: Record<string, string | undefined>
  pathname: string
  perPage: number
}) {
  const page = Number(currentPage) || 1
  const totalPages = Math.max(Number(pages) || 1, 1)
  const totalCount = Number(total) || 0

  const baseUrl = `${pathname}`
  
  function getPageUrl(p: number) {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set('search', params.search)
    if (params.category) searchParams.set('category', params.category)
    if (params.city) searchParams.set('city', params.city)
    if (params.voivodeship) searchParams.set('voivodeship', params.voivodeship)
    if (params.salaryMin) searchParams.set('salaryMin', params.salaryMin)
    if (params.salaryMax) searchParams.set('salaryMax', params.salaryMax)
    if (params.remote) searchParams.set('remote', params.remote)
    if (params.drivingLicense) searchParams.set('drivingLicense', params.drivingLicense)
    if (params.sort) searchParams.set('sort', params.sort)
    if (params.view) searchParams.set('view', params.view)
    if (params.external) searchParams.set('external', params.external)
    searchParams.set('page', String(p))
    searchParams.set('perPage', String(perPage))
    return `${baseUrl}?${searchParams.toString()}`
  }

  function getLimitUrl(limit: number) {
    const searchParams = new URLSearchParams()
    if (params.search) searchParams.set('search', params.search)
    if (params.category) searchParams.set('category', params.category)
    if (params.city) searchParams.set('city', params.city)
    if (params.voivodeship) searchParams.set('voivodeship', params.voivodeship)
    if (params.salaryMin) searchParams.set('salaryMin', params.salaryMin)
    if (params.salaryMax) searchParams.set('salaryMax', params.salaryMax)
    if (params.remote) searchParams.set('remote', params.remote)
    if (params.drivingLicense) searchParams.set('drivingLicense', params.drivingLicense)
    if (params.sort) searchParams.set('sort', params.sort)
    if (params.view) searchParams.set('view', params.view)
    if (params.external) searchParams.set('external', params.external)
    searchParams.set('page', '1')
    searchParams.set('perPage', String(limit))
    return `${baseUrl}?${searchParams.toString()}`
  }

  const fromItem = ((page - 1) * perPage) + 1
  const toItem = Math.min(page * perPage, totalCount)

  const pageButtons = []
  const maxVisible = 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1)
  
  for (let i = start; i <= end; i++) {
    pageButtons.push(i)
  }

  return (
    <div className="glass-card p-4 mt-6">
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm whitespace-nowrap" style={{ color: '#64748b' }}>Na stronę:</span>
          <div className="flex gap-1">
            {[10, 20, 50].map(n => (
              <a key={n} href={getLimitUrl(n)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  perPage === n
                    ? 'text-white'
                    : ''
                }`}
                style={perPage === n 
                  ? { background: 'linear-gradient(135deg, #f97015 0%, #ea6c00 100%)', boxShadow: '0 4px 12px rgba(249,112,21,0.3)' }
                  : { backgroundColor: 'rgba(255,255,255,0.5)', color: '#64748b' }
                }>
                {n}
              </a>
            ))}
          </div>
        </div>
        
        <p className="text-sm w-full sm:w-auto text-center sm:text-right order-first sm:order-none" style={{ color: '#64748b' }}>
          {totalCount > 0 ? `${fromItem}–${toItem} z ${totalCount.toLocaleString('pl-PL')}` : 'Brak ofert'}
        </p>

        <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
          <a href={getPageUrl(page - 1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
              page > 1 ? '' : ''
            }`}
            style={page > 1 
              ? { backgroundColor: 'rgba(255,255,255,0.7)', color: '#64748b', border: '1px solid rgba(255,255,255,0.5)' }
              : { backgroundColor: 'rgba(0,0,0,0.05)', color: '#94a3b8', cursor: 'not-allowed' }
            }>
            ←
          </a>
          
          {pageButtons[0] > 1 && (
            <>
              <a href={getPageUrl(1)} className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#64748b', border: '1px solid rgba(255,255,255,0.5)' }}>1</a>
              {pageButtons[0] > 2 && <span className="w-10 h-10 flex items-center justify-center" style={{ color: '#94a3b8' }}>...</span>}
            </>
          )}
          
          {pageButtons.map(p => (
            <a key={p} href={getPageUrl(p)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all"
              style={p === page 
                ? { background: 'linear-gradient(135deg, #f97015 0%, #ea6c00 100%)', color: 'white', boxShadow: '0 4px 12px rgba(249,112,21,0.3)' }
                : { backgroundColor: 'rgba(255,255,255,0.7)', color: '#64748b', border: '1px solid rgba(255,255,255,0.5)' }
              }>
              {p}
            </a>
          ))}
          
          {pageButtons[pageButtons.length - 1] < totalPages && (
            <>
              {pageButtons[pageButtons.length - 1] < totalPages - 1 && <span className="w-10 h-10 flex items-center justify-center" style={{ color: '#94a3b8' }}>...</span>}
              <a href={getPageUrl(totalPages)} className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: '#64748b', border: '1px solid rgba(255,255,255,0.5)' }}>{totalPages}</a>
            </>
          )}
          
          <a href={getPageUrl(page + 1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
              page < totalPages ? '' : ''
            }`}
            style={page < totalPages 
              ? { backgroundColor: 'rgba(255,255,255,0.7)', color: '#64748b', border: '1px solid rgba(255,255,255,0.5)' }
              : { backgroundColor: 'rgba(0,0,0,0.05)', color: '#94a3b8', cursor: 'not-allowed' }
            }>
            →
          </a>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="glass-card p-16 text-center">
      <p className="text-6xl mb-4">🔍</p>
      <p className="font-bold text-lg mb-2" style={{ color: '#1a1a2e' }}>Brak ofert</p>
      <p className="text-sm" style={{ color: '#94a3b8' }}>Spróbuj zmienić filtry lub wyszukiwanie</p>
    </div>
  )
}
