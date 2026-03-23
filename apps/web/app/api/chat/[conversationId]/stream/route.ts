import { NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ count: 0 })

  let count = 0

  if (session.user.role === 'person') {
    const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (profile) {
      count = await prisma.message.count({
        where: {
          read: false,
          senderCompanyId: { not: null },
          conversation: { personId: profile.id },
        },
      })
    }
  } else if (session.user.role === 'company') {
    const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    if (profile) {
      count = await prisma.message.count({
        where: {
          read: false,
          senderPersonId: { not: null },
          conversation: { companyId: profile.id },
        },
      })
    }
  }

  return NextResponse.json({ count })
}
