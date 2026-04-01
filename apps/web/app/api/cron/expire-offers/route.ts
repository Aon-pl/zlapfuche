import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const now = new Date()

    const result = await prisma.jobOffer.updateMany({
      where: {
        status: 'active',
        endDate: { lt: now },
      },
      data: { status: 'expired' },
    })

    console.log(`[cron] Expired ${result.count} offers`)
    return NextResponse.json({ success: true, expired: result.count })
  } catch (error) {
    console.error('[cron] Error expiring offers:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}