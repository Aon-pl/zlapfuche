import { NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function PATCH() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'person') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'Brak profilu' }, { status: 404 })

  const existing = await prisma.jobSeeker.findUnique({ where: { personId: profile.id } })
  if (!existing) return NextResponse.json({ error: 'Brak ogłoszenia' }, { status: 404 })

  const updated = await prisma.jobSeeker.update({
    where: { id: existing.id },
    data:  { active: !existing.active },
  })

  return NextResponse.json({ active: updated.active })
}
