import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import StarRating from '@/components/StarRating'
import RankingFilters from '@/components/RankingFilters'

interface PageProps {
  searchParams: Promise<{ city?: string; minRating?: string; sort?: string; page?: string }>
}

const SORT_OPTIONS = {
  rating_desc:  'Najwyżej oceniane',
  rating_asc:   'Najniżej oceniane',
  reviews_desc: 'Najwięcej opinii',
  newest:       'Najnowsze',
}

export default async function RankingPage({ searchParams }: PageProps) {
  const params      = await searchParams
  const currentPage = params.page ? Number(params.page) : 1
  const perPage     = 20
  const sort        = params.sort ?? 'rating_desc'
  const minRating   = params.minRating ? Number(params.minRating) : 0

  const companiesRaw = await prisma.companyProfile.findMany({
    where: params.city ? { city: { contains: params.city } } : {},
    include: { reviewsReceived: { where: { type: 'person_reviews_company' }, select: { rating: true } } },
  })

  let companies = companiesRaw
    .map(c => {
      const reviews = c.reviewsReceived
      const avg     = reviews.length
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0
      return { ...c, avg, reviewCount: reviews.length }
    })
    .filter(c => c.avg >= minRating || c.reviewCount === 0)

  if (sort === 'rating_desc')  companies.sort((a, b) => b.avg - a.avg || b.reviewCount - a.reviewCount)
  if (sort === 'rating_asc')   companies.sort((a, b) => a.avg - b.avg)
  if (sort === 'reviews_desc') companies.sort((a, b) => b.reviewCount - a.reviewCount)
  if (sort === 'newest')       companies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const total    = companies.length
  const paginated = companies.slice((currentPage - 1) * perPage, currentPage * perPage)
  const pages    = Math.ceil(total / perPage)

  const MEDALS = ['🥇', '🥈', '🥉']

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
            🏆 Ranking pracodawców
          </h1>
          <p className="text-gray-500 text-sm">Firmy oceniane przez pracowników i kandydatów</p>
          <RankingFilters params={params} sortOptions={SORT_OPTIONS} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <p className="text-sm text-gray-500 mb-5">
          <span className="font-bold text-gray-900">{total}</span> firm
          {params.city && <span className="text-orange-500 ml-1">· {params.city}</span>}
        </p>

        {paginated.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold text-gray-900">Brak wyników</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginated.map((company, index) => {
              const rank = (currentPage - 1) * perPage + index + 1
              return (
                <Link key={company.id} href={`/companies/${company.id}`}
                  className="flex items-center gap-4 bg-white border border-gray-100 hover:border-orange-200 hover:shadow-md rounded-2xl px-4 sm:px-5 py-4 transition-all group shadow-sm">

                  {/* Pozycja */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                    rank <= 3 ? '' : 'bg-gray-100 text-gray-500'
                  }`}
                    style={rank === 1 ? { background: '#fef3c7', color: '#d97706' } :
                           rank === 2 ? { background: '#f3f4f6', color: '#6b7280' } :
                           rank === 3 ? { background: '#fef3c7', color: '#92400e' } : {}}>
                    {rank <= 3 ? MEDALS[rank - 1] : rank}
                  </div>

                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-black text-white text-xl shrink-0"
                    style={{ background: '#f97015' }}>
                    {company.companyLogoUrl
                      ? <img src={company.companyLogoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                      : company.companyName[0]
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 group-hover:text-orange-500 transition-colors">{company.companyName}</p>
                      {company.verified && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">📍 {company.city}</p>
                  </div>

                  {/* Ocena */}
                  <div className="text-right shrink-0">
                    {company.reviewCount > 0 ? (
                      <>
                        <StarRating value={company.avg} size="sm" showValue />
                        <p className="text-xs text-gray-400 mt-0.5">{company.reviewCount} opinii</p>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">Brak opinii</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Paginacja */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <Link key={p}
                href={`/ranking?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  p === currentPage
                    ? 'text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'
                }`}
                style={p === currentPage ? { background: '#f97015' } : {}}>
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
