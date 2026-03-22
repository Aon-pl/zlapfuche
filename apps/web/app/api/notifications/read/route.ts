import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

// PATCH /api/notifications/read — oznacz wszystkie jako przeczytane
export async function PATCH() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data:  { read: true },
  })

  return NextResponse.json({ success: true })
}

// PATCH /api/notifications/read/[id] — oznacz jedną jako przeczytaną
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data:  { read: true },
  })

  return NextResponse.json({ success: true })
}
