import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, createMobileToken } from '@/lib/apiHelpers'

export async function POST(req: NextRequest) {
  try {
    const { email, password, role, firstName, lastName, companyName, city } = await req.json()

    if (!email || !password || !role) return apiError('Wypełnij wszystkie pola.')
    if (password.length < 8) return apiError('Hasło musi mieć co najmniej 8 znaków.')

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return apiError('Konto z tym emailem już istnieje.')

    const hashed = await bcrypt.hash(password, 12)

    let user
    if (role === 'person') {
      if (!firstName || !lastName) return apiError('Podaj imię i nazwisko.')
      user = await prisma.user.create({
        data: {
          email, password: hashed, role: 'person',
          personProfile: { create: { firstName, lastName } },
        },
        include: { personProfile: true },
      })
    } else if (role === 'company') {
      if (!companyName || !city) return apiError('Podaj nazwę firmy i miasto.')
      user = await prisma.user.create({
        data: {
          email, password: hashed, role: 'company',
          companyProfile: { create: { companyName, city } },
        },
        include: { companyProfile: true },
      })
    } else {
      return apiError('Nieprawidłowa rola.')
    }

    const token = createMobileToken(user.id, user.role)

    return apiSuccess({
      token,
      user: {
        id:    user.id,
        email: user.email,
        role:  user.role,
        name:  firstName ? `${firstName} ${lastName}` : companyName,
      },
    }, 201)
  } catch (error) {
    return apiError('Błąd serwera.', 500)
  }
}
