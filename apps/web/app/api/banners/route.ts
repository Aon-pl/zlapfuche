import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const position = searchParams.get('position') || 'offers'
  const now = new Date()

  const banners = await prisma.banner.findMany({
    where: {
      position,
      active: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json(banners)
}