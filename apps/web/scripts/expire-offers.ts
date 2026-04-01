import { prisma } from './lib/prisma'

async function expireOffers() {
  const now = new Date()

  // 1. Wygaś oferty których termin minął
  const expiredResult = await prisma.jobOffer.updateMany({
    where: {
      status: 'active',
      endDate: { lt: now },
    },
    data: { status: 'expired' },
  })

  // 2. Usuń oferty które są wygaśnięte od ponad 30 dni
  const deleteThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const deleteResult = await prisma.jobOffer.deleteMany({
    where: {
      status: 'expired',
      endDate: { lt: deleteThreshold },
    },
  })

  console.log(`[expire-offers] Expired: ${expiredResult.count}, Deleted: ${deleteResult.count}`)
}

expireOffers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())