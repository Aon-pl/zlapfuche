import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const FUCH_THRESHOLD = 10

export async function POST(req: Request) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || 'super-fuchowicz-secret-key'
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const personProfiles = await prisma.personProfile.findMany({
      include: {
        user: true,
        applications: {
          where: {
            status: 'completed',
            updatedAt: { gte: thirtyDaysAgo },
          },
        },
      },
    })

    let granted = 0
    let revoked = 0

    for (const profile of personProfiles) {
      const completedFuchs = profile.applications.length
      const hasAutoStatus = !profile.user.superFuchowiczGrantedBy
      const isCurrentlyActive = profile.user.isSuperFuchowicz

      if (completedFuchs >= FUCH_THRESHOLD && !isCurrentlyActive) {
        await prisma.user.update({
          where: { id: profile.userId },
          data: {
            isSuperFuchowicz: true,
            superFuchowiczGrantedBy: null,
            superFuchowiczGrantedAt: now,
          },
        })
        granted++
      } else if (completedFuchs < FUCH_THRESHOLD && isCurrentlyActive && hasAutoStatus) {
        await prisma.user.update({
          where: { id: profile.userId },
          data: {
            isSuperFuchowicz: false,
            superFuchowiczGrantedBy: null,
            superFuchowiczGrantedAt: null,
          },
        })
        revoked++
      }
    }

    console.log(`[cron] Super-Fuchowicz: granted=${granted}, revoked=${revoked}`)
    return NextResponse.json({ success: true, granted, revoked })
  } catch (error) {
    console.error('[cron] Error updating Super-Fuchowicz:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  return POST(req)
}
