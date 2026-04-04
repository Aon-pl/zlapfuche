import { NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      blocked: true,
      createdAt: true,
      isSuperFuchowicz: true,
      superFuchowiczGrantedBy: true,
      superFuchowiczGrantedAt: true,
      personProfile: {
        select: {
          firstName: true,
          lastName: true,
          city: true,
        },
      },
      companyProfile: {
        select: {
          companyName: true,
          city: true,
        },
      },
    },
    orderBy: [
      { isSuperFuchowicz: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json(users)
}
