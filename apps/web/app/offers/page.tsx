import { getOffers } from '@/app/actions/offers'
import OffersFilters from '@/components/OffersFilters'
import OffersClientWrapper from '@/components/OffersClientWrapper'

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
  }>
}

export default async function OffersPage({ searchParams }: PageProps) {
  const params      = await searchParams
  const currentPage = params.page ? Number(params.page) : 1

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
    perPage:        20,
  })

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header — wyszukiwarka */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <form className="flex-1 flex gap-3 max-w-2xl">
              {Object.entries(params)
                .filter(([k]) => !['search', 'page', 'view'].includes(k))
                .map(([k, v]) => v ? <input key={k} type="hidden" name={k} value={v} /> : null)}
              <div className="flex-1 relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input name="search" defaultValue={params.search} type="text"
                  placeholder="Szukaj stanowiska, słowa kluczowego..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all text-sm" />
              </div>
              <button type="submit"
                className="px-5 py-3 font-semibold rounded-xl text-white text-sm transition-all hover:opacity-90 whitespace-nowrap"
                style={{ background: '#f97015' }}>
                Szukaj
              </button>
            </form>
            <p className="text-sm text-gray-500 shrink-0">
              <span className="font-bold text-gray-900">{total}</span> ofert
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Sidebar */}
          <aside className="w-full sm:w-72 shrink-0">
            <OffersFilters params={params} />
          </aside>

          {/* Lista + widoki */}
          <main className="flex-1 min-w-0">
            <OffersClientWrapper
              offers={offers}
              total={total}
              pages={pages}
              currentPage={currentPage}
              params={params}
              initialView={(params.view as 'list' | 'grid' | 'map') ?? 'list'}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
