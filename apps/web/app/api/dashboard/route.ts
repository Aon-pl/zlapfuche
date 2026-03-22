import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, getMobileUser } from '@/lib/apiHelpers'

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req)
    if (!user) return apiError('Nie jesteś zalogowany.', 401)

    if (user.role === 'person' && user.personProfile) {
      const [applications, myOffers] = await Promise.all([
        prisma.application.findMany({
          where: { applicantId: user.personProfile.id },
          include: {
            offer: {
              include: {
                company: { select: { companyName: true } },
                person:  { select: { firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.jobOffer.findMany({
          where: { personId: user.personProfile.id },
          orderBy: { createdAt: 'desc' },
        }),
      ])
      return apiSuccess({ role: 'person', applications, myOffers })
    }

    if (user.role === 'company' && user.companyProfile) {
      const offers = await prisma.jobOffer.findMany({
        where: { companyId: user.companyProfile.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return apiSuccess({ role: 'company', offers })
    }

    return apiError('Brak profilu.', 400)
  } catch {
    return apiError('Błąd serwera.', 500)
  }
}
