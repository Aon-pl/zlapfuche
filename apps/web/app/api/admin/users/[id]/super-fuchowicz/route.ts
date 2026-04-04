import { NextRequest, NextResponse } from 'next-server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { isSuperFuchowicz } = body

  if (typeof isSuperFuchowicz !== 'boolean') {
    return NextResponse.json({ error: 'Invalid isSuperFuchowicz value' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      isSuperFuchowicz,
      superFuchowiczGrantedBy: isSuperFuchowicz ? session.user.id : null,
      superFuchowiczGrantedAt: isSuperFuchowicz ? new Date() : null,
    },
  })

  return NextResponse.json(updated)
}
