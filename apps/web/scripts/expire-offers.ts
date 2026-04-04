import { prisma } from '@/lib/prisma'
import mysql from 'mysql2/promise'

async function expireOffers() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // 1. Wygaś oferty których termin minął (endDate) - główna baza
  const expiredResult = await prisma.jobOffer.updateMany({
    where: {
      status: 'active',
      endDate: { lt: now },
    },
    data: { status: 'expired' },
  })

  // 2. Usuń oferty wygaśnięte ponad 30 dni temu - główna baza
  const deletedMain = await prisma.jobOffer.deleteMany({
    where: {
      status: 'expired',
      endDate: { lt: thirtyDaysAgo },
    },
  })

  // 3. Usuń oferty z job_scraper których job_date minął
  let deletedExternal = 0
  try {
    const externalDb = mysql.createPool({
      host: process.env.JOB_SCRAPER_DB_HOST || 'sql126.lh.pl',
      port: parseInt(process.env.JOB_SCRAPER_DB_PORT || '3306'),
      user: process.env.JOB_SCRAPER_DB_USER || 'serwer278713_jobscraper',
      password: process.env.JOB_SCRAPER_DB_PASSWORD || '6pbxI8sB6Q_TOvo',
      database: 'serwer278713_jobscraper',
    })

    const [result] = await externalDb.query(
      'DELETE FROM job_offers WHERE job_date < ?',
      [now]
    )
    deletedExternal = (result as any).affectedRows

    await externalDb.end()
  } catch (err) {
    console.error('[expire-offers] Błąd podczas usuwania z job_scraper:', err)
  }

  console.log(`[expire-offers] Expired: ${expiredResult.count}, Deleted (main): ${deletedMain.count}, Deleted (job_scraper): ${deletedExternal}`)
}

expireOffers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())