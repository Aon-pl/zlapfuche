'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth.node'
import { revalidatePath } from 'next/cache'

// Koordynaty miast do filtrowania po promieniu
const CITY_COORDS: Record<string, [number, number]> = {
  'warszawa':       [52.2297, 21.0122],
  'kraków':         [50.0647, 19.9450],
  'wrocław':        [51.1079, 17.0385],
  'poznań':         [52.4064, 16.9252],
  'gdańsk':         [54.3520, 18.6466],
  'szczecin':       [53.4285, 14.5528],
  'bydgoszcz':      [53.1235, 18.0084],
  'lublin':         [51.2465, 22.5684],
  'białystok':      [53.1325, 23.1688],
  'katowice':       [50.2649, 19.0238],
  'gdynia':         [54.5189, 18.5305],
  'częstochowa':    [50.8118, 19.1203],
  'radom':          [51.4027, 21.1470],
  'toruń':          [53.0138, 18.5981],
  'sosnowiec':      [50.2863, 19.1041],
  'kielce':         [50.8661, 20.6286],
  'rzeszów':        [50.0412, 21.9991],
  'olsztyn':        [53.7784, 20.4801],
  'bielsko-biała':  [49.8225, 19.0444],
  'gliwice':        [50.2945, 18.6714],
  'zabrze':         [50.3249, 18.7857],
  'bytom':          [50.3482, 18.9140],
  'łódź':           [51.7592, 19.4560],
}

function toRad(deg: number) { return deg * Math.PI / 180 }

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a    = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface OffersFilters {
  category?:       string
  city?:           string
  voivodeship?:    string
  radius?:         number
  salaryMin?:      number
  salaryMax?:      number
  remote?:         boolean
  drivingLicense?: boolean
  search?:         string
  sort?:           'newest' | 'salary_desc' | 'popular'
  page?:           number
  perPage?:        number
}

export async function getOffers(filters: OffersFilters = {}) {
  const {
    category, city, voivodeship, radius,
    salaryMin, salaryMax, remote, drivingLicense,
    search, sort = 'newest',
    page = 1, perPage = 20,
  } = filters

  const where: any = { status: 'active' }

  if (category)       where.category       = category
  if (remote)         where.remote         = true
  if (drivingLicense) where.drivingLicense = true
  if (voivodeship)    where.voivodeship    = { contains: voivodeship }
  if (salaryMin)      where.salaryMin      = { gte: salaryMin }
  if (salaryMax)      where.salaryMax      = { lte: salaryMax }
  if (search)         where.OR             = [
    { title:       { contains: search } },
    { description: { contains: search } },
  ]
  if (city && !radius) where.city = { contains: city }

  // Sortowanie
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'salary_desc') orderBy = [{ salaryMin: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }]
  if (sort === 'popular')     orderBy = [{ applicationsCount: 'desc' }, { createdAt: 'desc' }]

  const [allOffers, total] = await Promise.all([
    prisma.jobOffer.findMany({
      where,
      select: {
        id:                true,
        title:             true,
        city:              true,
        category:          true,
        status:            true,
        salaryMin:         true,
        salaryMax:         true,
        salaryType:        true,
        remote:            true,
        drivingLicense:    true,
        createdAt:         true,
        applicationsCount: true,
        postalCode:        true,
        lat:               true,
        lng:               true,
        company: { select: { id: true, companyName: true, companyLogoUrl: true } },
        person:  { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy,
      take: radius ? undefined : perPage,
      skip: radius ? undefined : (page - 1) * perPage,
    }),
    prisma.jobOffer.count({ where }),
  ])

  // Filtr po promieniu od miasta (w pamięci)
  if (city && radius) {
    const key    = city.toLowerCase().trim()
    const coords = CITY_COORDS[key]

    if (coords) {
      const [lat, lon] = coords
      const nearby = allOffers.filter((offer: typeof allOffers[0]) => {
        // Użyj lat/lng z bazy jeśli dostępne
        if (offer.lat && offer.lng) {
          return distanceKm(lat, lon, offer.lat, offer.lng) <= radius
        }
        const offerKey    = offer.city?.toLowerCase().trim() ?? ''
        const offerCoords = CITY_COORDS[offerKey]
        if (!offerCoords) return offer.city?.toLowerCase().includes(key)
        return distanceKm(lat, lon, offerCoords[0], offerCoords[1]) <= radius
      })
      const start = (page - 1) * perPage
      return {
        offers: nearby.slice(start, start + perPage),
        total:  nearby.length,
        pages:  Math.ceil(nearby.length / perPage),
      }
    }
    where.city = { contains: city }
  }

  return {
    offers: allOffers,
    total,
    pages: Math.ceil(total / perPage),
  }
}

export async function createOffer(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Nie jesteś zalogowany.' }

  try {
    let companyId: string | undefined
    let personId:  string | undefined

    if (session.user.role === 'company') {
      const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
      if (!company) return { error: 'Brak profilu firmy.' }
      companyId = company.id
    } else {
      const person = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
      if (!person) return { error: 'Brak profilu.' }
      personId = person.id
    }

    const postalCode = (formData.get('postalCode') as string)?.trim() || null
    const city       = formData.get('city') as string

    // Geokodowanie przez Nominatim (OpenStreetMap)
    let lat: number | null = null
    let lng: number | null = null
    if (postalCode) {
      const { geocodePostalCode } = await import('@/lib/geocode')
      const coords = await geocodePostalCode(postalCode, city)
      if (coords) { lat = coords.lat; lng = coords.lng }
    }

    const offer = await prisma.jobOffer.create({
      data: {
        title:          formData.get('title')       as string,
        description:    formData.get('description') as string,
        category:       formData.get('category')    as string,
        city,
        voivodeship:    (formData.get('voivodeship') as string) || null,
        remote:         formData.get('remote') === 'true',
        salaryMin:      formData.get('salaryMin') ? Number(formData.get('salaryMin')) : null,
        salaryMax:      formData.get('salaryMax') ? Number(formData.get('salaryMax')) : null,
        salaryType:     (formData.get('salaryType') as string) || 'hourly',
        startDate:      formData.get('startDate') ? new Date(formData.get('startDate') as string) : null,
        endDate:        formData.get('endDate')   ? new Date(formData.get('endDate')   as string) : null,
        hoursPerWeek:   formData.get('hoursPerWeek') ? Number(formData.get('hoursPerWeek')) : null,
        minAge:         formData.get('minAge') ? Number(formData.get('minAge')) : 18,
        drivingLicense: formData.get('drivingLicense') === 'true',
        status:         'active',
        postalCode,
        lat,
        lng,
        companyId:      companyId ?? null,
        personId:       personId  ?? null,
      },
    })

    revalidatePath('/offers')
    revalidatePath('/dashboard')
    return { success: true, offerId: offer.id }
  } catch (error) {
    console.error('Create offer error:', error)
    return { error: 'Nie udało się dodać oferty.' }
  }
}
