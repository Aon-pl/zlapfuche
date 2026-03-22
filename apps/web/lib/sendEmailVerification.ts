import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

// Wywołaj tę funkcję zaraz po utworzeniu użytkownika w akcji rejestracji
export async function sendEmailVerification(userId: string, email: string) {
  // Usuń stare tokeny
  await prisma.emailVerificationToken.deleteMany({ where: { userId } })

  // Stwórz nowy token (ważny 24h)
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  // Wyślij email
  await sendVerificationEmail(email, token)
}
