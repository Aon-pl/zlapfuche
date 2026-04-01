import { NextRequest } from 'next/server'
import { getExternalOffers } from '@/lib/externalDb'
import { apiSuccess, apiError } from '@/lib/apiHelpers'

export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams
    const page = Number(s.get('page') ?? 1)
    const limit = Number(s.get('limit') ?? 20)
    const search = s.get('search') ?? undefined
    const location = s.get('location') ?? undefined

    const result = await getExternalOffers({ page, limit, search, location })

    return apiSuccess(result)
  } catch (error) {
    console.error('Error fetching external offers:', error)
    return apiError('Błąd serwera.', 500)
  }
}
