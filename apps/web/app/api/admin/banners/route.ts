import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error('GET banners error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        content: data.content || null,
        imageUrl: data.imageUrl || null,
        linkUrl: data.linkUrl || null,
        position: data.position || 'offers',
        active: data.active ?? true,
        order: data.order ?? 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    })

    return NextResponse.json(banner)
  } catch (error) {
    console.error('POST banner error:', error)
    return NextResponse.json({ error: 'Internal error: ' + String(error) }, { status: 500 })
  }
}