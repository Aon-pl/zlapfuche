'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const SALARY_TYPE: Record<string, string> = { hourly: 'godz.', daily: 'dzien', monthly: 'mies.' }

interface Offer {
  id: string
  title: string
  city: string
  lat?: number | null
  lng?: number | null
  salaryMin: number | null
  salaryMax: number | null
  salaryType: string
  company?: { companyName: string } | null
  person?:  { firstName: string; lastName: string } | null
}

interface Props {
  offers: Offer[]
}

export default function OffersMap({ offers }: Props) {
  const router = useRouter()
  const mapRef      = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  // Oferty z koordynatami
  const geoOffers = offers.filter(o => o.lat && o.lng)
  const missing   = offers.length - geoOffers.length

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    if (geoOffers.length === 0) return

    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Wycentruj na sredniej wspolrzednych
      const avgLat = geoOffers.reduce((s, o) => s + o.lat!, 0) / geoOffers.length
      const avgLng = geoOffers.reduce((s, o) => s + o.lng!, 0) / geoOffers.length

      const map = L.map(mapRef.current!, {
        center: [avgLat, avgLng],
        zoom:   geoOffers.length === 1 ? 12 : 6,
      })
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Grupuj po wspolrzednych (zaokraglonych do 3 miejsc po przecinku)
      const byCoord: Record<string, Offer[]> = {}
      geoOffers.forEach(o => {
        const key = `${o.lat!.toFixed(3)}_${o.lng!.toFixed(3)}`
        if (!byCoord[key]) byCoord[key] = []
        byCoord[key].push(o)
      })

      Object.entries(byCoord).forEach(([, cityOffers]) => {
        const count = cityOffers.length
        const first = cityOffers[0]

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:${count > 9 ? 42 : 36}px;height:${count > 9 ? 42 : 36}px;
            background:#f97015;border:3px solid #fff;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-weight:900;font-size:${count > 9 ? 11 : 13}px;color:#fff;
            box-shadow:0 2px 10px rgba(249,112,21,0.45);
            font-family:Inter,sans-serif;cursor:pointer;
          ">${count}</div>`,
          iconSize:   [count > 9 ? 42 : 36, count > 9 ? 42 : 36],
          iconAnchor: [count > 9 ? 21 : 18, count > 9 ? 21 : 18],
        })

        const marker = L.marker([first.lat!, first.lng!], { icon }).addTo(map)

        const items = cityOffers.slice(0, 5).map(o => {
          const author = o.company?.companyName ?? (o.person ? `${o.person.firstName} ${o.person.lastName}` : '')
          const salary = o.salaryMin ? `${o.salaryMin}+ zl/${SALARY_TYPE[o.salaryType]}` : ''
          return `<div class="offer-popup-item" data-id="${o.id}" style="padding:7px 0;border-bottom:1px solid #f3f4f6;cursor:pointer;">
            <p style="font-weight:700;font-size:13px;color:#111827;margin:0;line-height:1.3">${o.title}</p>
            <p style="font-size:11px;color:#6b7280;margin:2px 0 0">${author}${salary ? ` <span style="color:#f97015;font-weight:600">· ${salary}</span>` : ''}</p>
          </div>`
        }).join('')

        const more = count > 5
          ? `<p style="font-size:12px;color:#f97015;font-weight:700;padding-top:6px;margin:0">+${count - 5} wiecej ofert</p>`
          : ''

        marker.bindPopup(
          L.popup({ maxWidth: 280 }).setContent(`
            <div style="font-family:Inter,sans-serif;padding:2px 0">
              <p style="font-weight:900;font-size:14px;color:#111827;margin:0 0 8px;letter-spacing:-0.01em">
                📍 ${first.city} <span style="color:#f97015">(${count})</span>
              </p>
              ${items}${more}
            </div>`)
        )

        marker.on('popupopen', () => {
          setTimeout(() => {
            document.querySelectorAll('.offer-popup-item').forEach(el => {
              const el2 = el as HTMLElement
              el2.addEventListener('mouseenter', () => { el2.style.background = '#fff7ed' })
              el2.addEventListener('mouseleave', () => { el2.style.background = ''        })
              el2.addEventListener('click',      () => {
                const id = el2.dataset.id
                if (id) { map.closePopup(); router.push(`/offers/${id}`) }
              })
            })
          }, 50)
        })
      })

      // Dopasuj widok do wszystkich markerow
      if (geoOffers.length > 1) {
        const bounds = L.latLngBounds(geoOffers.map(o => [o.lat!, o.lng!]))
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    })

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null }
    }
  }, [])

  if (geoOffers.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl gap-3 p-8 text-center">
        <p className="text-4xl">🗺️</p>
        <p className="font-bold text-gray-900">Brak ofert z lokalizacja</p>
        <p className="text-sm text-gray-500 max-w-xs">
          Oferty pojawia sie na mapie jezeli zostaly dodane z kodem pocztowym.
          Nowe ogloszenia beda widoczne automatycznie.
        </p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />
      <div ref={mapRef} className="w-full h-full" />
      {missing > 0 && (
        <div className="absolute bottom-3 left-3 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500 shadow-sm z-[1000]">
          {geoOffers.length} z {offers.length} ofert widocznych na mapie
        </div>
      )}
    </div>
  )
}
