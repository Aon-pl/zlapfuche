import { getOffers } from '@/app/actions/offers'
import { getExternalOffers } from '@/lib/externalDb'
import OffersFilters from '@/components/OffersFilters'
import OffersClientWrapper from '@/components/OffersClientWrapper'
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

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)' }}>

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
