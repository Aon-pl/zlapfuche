import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  console.log('[verify-email] token:', token?.slice(0, 20) + '...')

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/login?error=invalid_token`)
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, emailVerified: true } } },
  })

  console.log('[verify-email] record found:', !!record)
  console.log('[verify-email] user emailVerified:', record?.user?.emailVerified)

  if (!record) {
    return NextResponse.redirect(`${BASE_URL}/login?error=invalid_token`)
  }

  if (record.expiresAt < new Date()) {
    console.log('[verify-email] token expired')
    await prisma.emailVerificationToken.delete({ where: { id: record.id } })
    return NextResponse.redirect(`${BASE_URL}/login?error=token_expired`)
  }

  if (record.user.emailVerified) {
    console.log('[verify-email] already verified')
    return NextResponse.redirect(`${BASE_URL}/login?verified=already`)
  }

  // Zaktualizuj użytkownika
  const updated = await prisma.user.update({
    where: { id: record.userId },
    data:  { emailVerified: true },
  })

  console.log('[verify-email] updated emailVerified:', updated.emailVerified)

  // Usuń token
  await prisma.emailVerificationToken.delete({ where: { id: record.id } })

  console.log('[verify-email] redirect to login with success')
  return NextResponse.redirect(`${BASE_URL}/login?verified=1`)
}
