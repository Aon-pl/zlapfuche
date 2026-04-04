import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/requireAdmin'
import AdminBannersClient from './BannersClient'

export default async function BannersPage() {
  await requireAdmin()

  let banners: any[] = []
  try {
    banners = await prisma.banner.findMany({
      orderBy: { order: 'asc' },
    })
  } catch (e) {
    // table not exists yet
  }

  return <AdminBannersClient initialBanners={banners} />
}