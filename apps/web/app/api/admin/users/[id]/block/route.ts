import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'
import { logAction } from '@/lib/logs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  await requireAdmin()

  const { id } = await params
  const { blocked } = await request.json()

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  if (user.role === 'admin') {
    return NextResponse.json({ error: 'Cannot block admin' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id },
    data: { blocked },
  })

  await logAction({
    action: blocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
    entity: 'User',
    entityId: id,
    details: `User: ${user.email}, Blocked: ${blocked}`,
  })

  return NextResponse.json({ success: true })
}
