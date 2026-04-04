import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const data = await req.json()

  const banner = await prisma.banner.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl }),
      ...(data.position !== undefined && { position: data.position }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
      ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
    },
  })

  return NextResponse.json(banner)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  await prisma.banner.delete({ where: { id } })

  return NextResponse.json({ success: true })
}