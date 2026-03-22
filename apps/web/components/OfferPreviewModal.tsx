'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const CATEGORY_LABELS: Record<string, string> = {
  warehouse: '📦 Magazyn', construction: '🏗️ Budowlanka',
  hospitality: '🍽️ Gastronomia', transport: '🚛 Transport',
  retail: '🛒 Handel', manufacturing: '⚙️ Produkcja',
  cleaning: '🧹 Sprzątanie', agriculture: '🌾 Rolnictwo',
  office: '💼 Biuro', other: '🔧 Inne',
}
const SALARY_TYPE: Record<string, string> = { hourly: 'godz.', daily: 'dzień', monthly: 'mies.' }

interface Offer {
  id: string; title: string; description: string; city: string
  salaryMin: number | null; salaryMax: number | null; salaryType: string
  category: string; remote: boolean; drivingLicense: boolean; startDate: string
  applicationsCount: number
  company?: { id: string; companyName: string; companyLogoUrl: string | null } | null
  person?:  { id: string; firstName: string; lastName: string } | null
}

interface Props {
  offerId: string
  onClose: () => void
}

export default function OfferPreviewModal({ offerId, onClose }: Props) {
  const [offer,   setOffer]   = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/offers/preview/${offerId}`)
      .then(r => r.json())
      .then(d => { setOffer(d.offer); setLoading(false) })
      .catch(() => setLoading(false))
  }, [offerId])

  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const author  = offer?.company?.companyName ?? (offer?.person ? `${offer.person.firstName} ${offer.person.lastName}` : '')
  const salary  = offer?.salaryMin
    ? `${offer.salaryMin}${offer.salaryMax ? `–${offer.salaryMax}` : '+'} zł/${SALARY_TYPE[offer.salaryType]}`
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}>

      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Szybki podgląd</p>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-lg">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: '#f97015', borderTopColor: 'transparent' }} />
            </div>
          ) : !offer ? (
            <p className="text-center py-10 text-gray-400">Nie znaleziono oferty.</p>
          ) : (
            <div className="space-y-5">

              {/* Autor */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shrink-0 overflow-hidden"
                  style={{ background: '#f97015' }}>
                  {offer.company?.companyLogoUrl
                    ? <img src={offer.company.companyLogoUrl} alt={author} className="w-full h-full object-cover" />
                    : author[0]
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-gray-900 leading-snug" style={{ letterSpacing: '-0.01em' }}>
                    {offer.title}
                  </h2>
                  {offer.company
                    ? <Link href={`/companies/${offer.company.id}`} className="text-sm font-semibold hover:underline" style={{ color: '#f97015' }}>{author}</Link>
                    : offer.person
                      ? <Link href={`/persons/${offer.person.id}`} className="text-sm font-semibold hover:underline" style={{ color: '#f97015' }}>{author}</Link>
                      : <p className="text-sm text-gray-500">{author}</p>
                  }
                  <p className="text-sm text-gray-500 mt-0.5">📍 {offer.city}</p>
                </div>
              </div>

              {/* Tagi */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: 'rgba(249,112,21,0.1)', color: '#f97015' }}>
                  {CATEGORY_LABELS[offer.category]}
                </span>
                {offer.remote && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-semibold">🏠 Zdalna</span>
                )}
                {offer.drivingLicense && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 font-medium">🚗 Prawo jazdy</span>
                )}
                <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                  {offer.applicationsCount} aplikacji
                </span>
              </div>

              {/* Wynagrodzenie */}
              {salary && (
                <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(249,112,21,0.06)', border: '1px solid rgba(249,112,21,0.15)' }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97015' }}>Wynagrodzenie</p>
                  <p className="text-2xl font-black" style={{ color: '#f97015', letterSpacing: '-0.02em' }}>{salary}</p>
                </div>
              )}

              {/* Opis */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Opis stanowiska</p>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-6 whitespace-pre-line">
                  {offer.description}
                </p>
              </div>

              {/* Szczegóły */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Start</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">
                    {new Date(offer.startDate).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Lokalizacja</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">📍 {offer.city}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer — CTA */}
        {offer && (
          <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 transition-all">
              Zamknij
            </button>
            <Link href={`/offers/${offer.id}`}
              className="flex-1 py-3 rounded-xl text-sm font-bold text-white text-center transition-all hover:opacity-90"
              style={{ background: '#f97015' }}>
              Aplikuj →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
