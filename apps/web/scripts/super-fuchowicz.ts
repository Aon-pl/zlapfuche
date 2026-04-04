import { prisma } from '@/lib/prisma'

const FUCH_THRESHOLD = 10

async function updateSuperFuchowicz() {
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

  console.log(`[super-fuchowicz] Granted: ${granted}, Revoked: ${revoked}`)
}

updateSuperFuchowicz()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
