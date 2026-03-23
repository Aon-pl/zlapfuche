import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailVerification } from '@/lib/sendEmailVerification'

// Rate limit — max 1 email co 60s per adres
const lastSent = new Map<string, number>()

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  // Rate limit
  const last = lastSent.get(email) ?? 0
  if (Date.now() - last < 60_000) {
    return NextResponse.json({ error: 'Poczekaj chwilę przed ponownym wysłaniem.' }, { status: 429 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // Nie zdradzamy że użytkownik nie istnieje
    return NextResponse.json({ success: true })
  }
  if (user.emailVerified) {
    return NextResponse.json({ error: 'Email już zweryfikowany.' }, { status: 400 })
  }

  await sendEmailVerification(user.id, user.email)
  lastSent.set(email, Date.now())

  return NextResponse.json({ success: true })
}
