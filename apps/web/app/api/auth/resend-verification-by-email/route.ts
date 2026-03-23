import { NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.emailVerified) return NextResponse.json({ error: 'Email już zweryfikowany' }, { status: 400 })

  // Usuń stare tokeny tego użytkownika
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  })

  // Stwórz nowy token
  const token = crypto.randomBytes(32).toString('hex')
  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId:    user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  })

  await sendVerificationEmail(user.email, token)

  return NextResponse.json({ success: true })
}
