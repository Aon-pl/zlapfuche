'use client'

import { useCallback, useEffect } from 'react'
import Link from 'next/link'

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
  offer: ExternalOffer
  onClose: () => void
}

export default function ExternalOfferPreviewModal({ offer, onClose }: Props) {
  const handleBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdrop}>

      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-green-100 text-green-700">🌐 {offer.source}</span>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Szybki podgląd</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all text-lg">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-5">

            {/* Autor */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shrink-0 overflow-hidden bg-green-500">
                🌐
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-black text-gray-900 leading-snug" style={{ letterSpacing: '-0.01em' }}>
                  {offer.title}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">📍 {offer.location || offer.city}</p>
              </div>
            </div>

            {/* Tagi */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-3 py-1.5 rounded-full font-semibold bg-green-100 text-green-700">
                🌐 Zewnętrzna oferta
              </span>
              {offer.work_time && (
                <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                  {offer.work_time}
                </span>
              )}
            </div>

            {/* Wynagrodzenie */}
            {offer.salary && (
              <div className="px-5 py-4 rounded-2xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-green-600">Wynagrodzenie</p>
                <p className="text-2xl font-black text-green-600" style={{ letterSpacing: '-0.02em' }}>{offer.salary}</p>
              </div>
            )}

            {/* Opis */}
            {offer.description && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Opis stanowiska</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line line-clamp-6">
                  {offer.description}
                </p>
              </div>
            )}

            {/* Informacja */}
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">ℹ️ Uwaga:</span> Ta oferta pochodzi z zewnętrznego źródła ({offer.source}). Aby aplikować, kliknij przycisk poniżej, który przekieruje Cię na stronę źródłową.
              </p>
            </div>

          </div>
        </div>

        {/* Footer — CTA */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:border-gray-300 transition-all">
            Zamknij
          </button>
          <a href={offer.externalUrl} target="_blank" rel="noopener noreferrer"
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white text-center transition-all hover:opacity-90"
            style={{ background: '#22c55e' }}>
            Otwórz na {offer.source} →
          </a>
        </div>
      </div>
    </div>
  )
}
