import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, getMobileUser } from '@/lib/apiHelpers'

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req)
    if (!user) return apiError('Nie jesteś zalogowany.', 401)

    return apiSuccess({
      id:             user.id,
      email:          user.email,
      role:           user.role,
      phone:          user.phone,
      personProfile:  user.personProfile,
      companyProfile: user.companyProfile,
    })
  } catch {
    return apiError('Błąd serwera.', 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getMobileUser(req)
    if (!user) return apiError('Nie jesteś zalogowany.', 401)

    const body = await req.json()

    if (user.role === 'person' && user.personProfile) {
      const { firstName, lastName, city, bio, experienceYears, skills, availableFrom, phone } = body
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { phone: phone ?? undefined } }),
        prisma.personProfile.update({
          where: { id: user.personProfile.id },
          data: {
            firstName:       firstName       ?? undefined,
            lastName:        lastName        ?? undefined,
            city:            city            ?? undefined,
            bio:             bio             ?? undefined,
            experienceYears: experienceYears !== undefined ? Number(experienceYears) : undefined,
            skills:          skills ? JSON.stringify(skills) : undefined,
            availableFrom:   availableFrom ? new Date(availableFrom) : undefined,
          },
        }),
      ])
    } else if (user.role === 'company' && user.companyProfile) {
      const { companyName, city, address, website, description, nip, phone } = body
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { phone: phone ?? undefined } }),
        prisma.companyProfile.update({
          where: { id: user.companyProfile.id },
          data: {
            companyName: companyName ?? undefined,
            city:        city        ?? undefined,
            address:     address     ?? undefined,
            website:     website     ?? undefined,
            description: description ?? undefined,
            nip:         nip         ?? undefined,
          },
        }),
      ])
    }

    return apiSuccess({ message: 'Profil zaktualizowany.' })
  } catch {
    return apiError('Błąd serwera.', 500)
  }
}
