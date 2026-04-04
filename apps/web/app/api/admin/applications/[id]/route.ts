import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const { status } = body

  if (!['pending', 'viewed', 'accepted', 'rejected', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const application = await prisma.application.findUnique({ where: { id } })
  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json(updated)
}
