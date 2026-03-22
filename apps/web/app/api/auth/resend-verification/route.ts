import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url))
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url))
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } })
    return NextResponse.redirect(new URL('/login?error=token_expired', req.url))
  }

  if (record.user.emailVerified) {
    return NextResponse.redirect(new URL('/dashboard?verified=already', req.url))
  }

  // Oznacz email jako zweryfikowany i usuń token
  await Promise.all([
    prisma.user.update({
      where: { id: record.userId },
      data:  { emailVerified: true },
    }),
    prisma.emailVerificationToken.delete({ where: { id: record.id } }),
  ])

  return NextResponse.redirect(new URL('/dashboard?verified=1', req.url))
}
