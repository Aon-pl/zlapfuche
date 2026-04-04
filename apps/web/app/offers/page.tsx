import { getOffers } from '@/app/actions/offers'
import { getExternalOffers } from '@/lib/externalDb'
import { prisma } from '@/lib/prisma'
import OffersFilters from '@/components/OffersFilters'
import OffersClientWrapper from '@/components/OffersClientWrapper'
import Link from 'next/link'
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    category?:       string
    city?:           string
    voivodeship?:    string
    salaryMin?:      string
    salaryMax?:      string
    remote?:         string
    drivingLicense?: string
    search?:         string
    sort?:           string
    view?:           string
    page?:           string
    perPage?:        string
    external?:       string
    extPage?:        string
    extLimit?:       string
  }>
}

export default async function OffersPage({ searchParams }: PageProps) {
  const params      = await searchParams
  const currentPage = params.page ? Number(params.page) : 1
  const perPage = params.perPage ? Number(params.perPage) : 20
  const showExternal = params.external === 'true'

  const { offers, total, pages } = await getOffers({
    category:       params.category,
    city:           params.city,
    voivodeship:    params.voivodeship,
    search:         params.search,
    salaryMin:      params.salaryMin      ? Number(params.salaryMin)  : undefined,
    salaryMax:      params.salaryMax      ? Number(params.salaryMax)  : undefined,
    remote:         params.remote         === 'true' ? true           : undefined,
    drivingLicense: params.drivingLicense === 'true' ? true           : undefined,
    sort:           params.sort           as 'newest' | 'salary_desc' | 'popular' | undefined,
    page:           currentPage,
    perPage:        perPage,
  })

  let externalOffersFormatted: Array<{
    id: string
    isExternal: true
    source: string
    externalUrl: string
    title: string
    description: string | null
    city: string | null
    salary: string | null
    createdAt: Date
    location: string | null
    work_time: string | null
  }> = []
  
  let externalTotal = 0
  
  if (showExternal) {
    try {
      const externalData = await getExternalOffers({
        search: params.search,
        location: params.city || undefined,
        page: currentPage,
        limit: perPage,
      })
      externalTotal = externalData.pagination.total
      externalOffersFormatted = externalData.offers.map(offer => ({
        id: `ext_${offer.id}`,
        isExternal: true as const,
        source: offer.source,
        externalUrl: offer.url,
        title: offer.title,
        description: offer.description,
        city: offer.location,
        salary: offer.salary,
        createdAt: offer.created_at,
        location: offer.location,
        work_time: offer.work_time,
      }))
    } catch (error) {
      console.error('Error fetching external offers:', error)
    }
  }

  const allOffersTotal = total + externalTotal

  let banners: any[] = []
  try {
    banners = await prisma.banner.findMany({
      where: {
        position: 'offers',
        active: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: new Date() }, endDate: null },
          { startDate: null, endDate: { gte: new Date() } },
          { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
        ],
      },
      orderBy: { order: 'asc' },
    })
  } catch (e) {
    // Banner model not yet in DB
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)' }}>

      {/* Banners */}
      {banners.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="space-y-3">
            {banners.map(banner => (
              banner.imageUrl || banner.mobileImageUrl ? (
                <a key={banner.id} href={banner.linkUrl || '#'} target={banner.linkUrl?.startsWith('http') ? '_blank' : '_self'}
                  className="block rounded-xl overflow-hidden transition-all hover:opacity-95">
                  <picture>
                    {banner.mobileImageUrl && (
                      <source srcSet={banner.mobileImageUrl} media="(max-width: 639px)" />
                    )}
                    <img src={banner.imageUrl || banner.mobileImageUrl || ''} alt={banner.title} className="w-full h-auto object-cover" style={{ maxHeight: '120px' }} />
                  </picture>
                </a>
              ) : (
                <a key={banner.id} href={banner.linkUrl || '#'} target={banner.linkUrl?.startsWith('http') ? '_blank' : '_self'}
                  className="block glass-card p-4 rounded-xl transition-all hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, rgba(249,112,21,0.1) 0%, rgba(249,112,21,0.05) 100%)' }}>
                  <p className="font-bold text-base" style={{ color: '#f97015' }}>{banner.title}</p>
                  {banner.content && <p className="text-sm mt-1" style={{ color: '#64748b' }}>{banner.content}</p>}
                </a>
              )
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <OffersFilters params={params} />
          </aside>

          {/* Lista + widoki */}
          <main className="flex-1 min-w-0">
            <OffersClientWrapper
              offers={offers}
              total={allOffersTotal}
              totalInternal={total}
              pages={Math.ceil(allOffersTotal / perPage)}
              currentPage={currentPage}
              params={params}
              perPage={perPage}
              initialView={(params.view as 'list' | 'grid' | 'map') ?? 'list'}
              showExternal={showExternal}
              externalOffers={externalOffersFormatted}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
