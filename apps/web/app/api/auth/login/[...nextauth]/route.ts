import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, createMobileToken } from '@/lib/apiHelpers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return apiError('Podaj email i hasło.')

    const user = await prisma.user.findUnique({
      where: { email },
      include: { personProfile: true, companyProfile: true },
    })
    if (!user) return apiError('Nieprawidłowy email lub hasło.', 401)
    if (user.blocked) return apiError('Konto zostało zablokowane.', 403)

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return apiError('Nieprawidłowy email lub hasło.', 401)

    const token = createMobileToken(user.id, user.role)

    return apiSuccess({
      token,
      user: {
        id:    user.id,
        email: user.email,
        role:  user.role,
        name:  user.personProfile
          ? `${user.personProfile.firstName} ${user.personProfile.lastName}`
          : user.companyProfile?.companyName ?? user.email,
      },
    })
  } catch (error) {
    return apiError('Błąd serwera.', 500)
  }
}
