// lib/geocode.ts
// Geokodowanie przez Nominatim (OpenStreetMap) — darmowe, bez klucza API

export async function geocodePostalCode(postalCode: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Format kodu pocztowego PL: XX-XXX
    const formatted = postalCode.replace(/[^0-9]/g, '').replace(/(\d{2})(\d{3})/, '$1-$2')

    const query = encodeURIComponent(`${formatted}, ${city}, Poland`)
    const url   = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=pl`

    const res  = await fetch(url, {
      headers: { 'User-Agent': 'PracaTymczasowa/1.0' },
      next:    { revalidate: 86400 }, // cache 24h
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!data.length) {
      // Fallback — szukaj tylko po kodzie
      const res2  = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${formatted}&country=Poland&format=json&limit=1`,
        { headers: { 'User-Agent': 'PracaTymczasowa/1.0' } }
      )
      const data2 = await res2.json()
      if (!data2.length) return null
      return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon) }
    }

    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
  } catch {
    return null
  }
}
