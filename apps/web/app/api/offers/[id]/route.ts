import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, getMobileUser } from '@/lib/apiHelpers'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const offer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        company: { select: { companyName: true, companyLogoUrl: true, description: true, website: true, city: true } },
        person:  { select: { firstName: true, lastName: true, city: true } },
        _count:  { select: { applications: true } },
      },
    })
    if (!offer) return apiError('Nie znaleziono oferty.', 404)
    return apiSuccess(offer)
  } catch {
    return apiError('Błąd serwera.', 500)
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getMobileUser(req)
    if (!user) return apiError('Nie jesteś zalogowany.', 401)
    if (user.role !== 'person') return apiError('Tylko osoby prywatne mogą aplikować.', 403)
    if (!user.personProfile) return apiError('Brak profilu.', 400)

    const { coverLetter } = await req.json()

    const app = await prisma.application.create({
      data: {
        offerId:     id,
        applicantId: user.personProfile.id,
        coverLetter: coverLetter ?? null,
        status:      'pending',
      },
    })

    await prisma.jobOffer.update({
      where: { id },
      data: { applicationsCount: { increment: 1 } },
    })

    return apiSuccess(app, 201)
  } catch (error: any) {
    if (error?.code === 'P2002') return apiError('Już aplikowałeś na tę ofertę.')
    return apiError('Błąd serwera.', 500)
  }
}
