import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/apiHelpers'

export async function GET(req: NextRequest) {
  try {
    const s = req.nextUrl.searchParams
    const category    = s.get('category') ?? undefined
    const city        = s.get('city') ?? undefined
    const voivodeship = s.get('voivodeship') ?? undefined
    const search      = s.get('search') ?? undefined
    const remote      = s.get('remote') === 'true' ? true : undefined
    const salaryMin   = s.get('salaryMin') ? Number(s.get('salaryMin')) : undefined
    const salaryMax   = s.get('salaryMax') ? Number(s.get('salaryMax')) : undefined
    const page        = Number(s.get('page') ?? 1)
    const perPage     = Number(s.get('perPage') ?? 20)

    const where: any = { status: 'active' }
    if (category)    where.category    = category
    if (remote)      where.remote      = true
    if (voivodeship) where.voivodeship = { contains: voivodeship }
    if (city)        where.city        = { contains: city }
    if (search)      where.OR = [
      { title:       { contains: search } },
      { description: { contains: search } },
    ]
    if (salaryMin) where.salaryMin = { gte: salaryMin }
    if (salaryMax) where.salaryMax = { lte: salaryMax }

    const [offers, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        include: {
          company: { select: { companyName: true, companyLogoUrl: true } },
          person:  { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: perPage,
        skip: (page - 1) * perPage,
      }),
      prisma.jobOffer.count({ where }),
    ])

    return apiSuccess({ offers, total, page, pages: Math.ceil(total / perPage) })
  } catch (error) {
    return apiError('Błąd serwera.', 500)
  }
}
