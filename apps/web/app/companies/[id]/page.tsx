import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StarRating from '@/components/StarRating'
import ReviewForm from '@/components/ReviewForm'
import CompanyReplyButton from '@/components/CompanyReplyButton'

interface Props { params: Promise<{ id: string }> }

const SALARY_TYPE: Record<string, string> = { hourly: 'godz.', daily: 'dzień', monthly: 'mies.' }

export default async function CompanyProfilePage({ params }: Props) {
  const { id }  = await params
  const session = await auth()

  const company = await prisma.companyProfile.findUnique({
    where: { id },
    include: { jobOffers: { where: { status: 'active' }, orderBy: { createdAt: 'desc' }, take: 5 } },
  })
  if (!company) notFound()

  const reviews = await prisma.review.findMany({
    where: { targetCompanyId: id, type: 'person_reviews_company' },
    include: { authorPerson: { select: { firstName: true, lastName: true } }, jobOffer: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  let canReview       = false
  let currentUserReviewIds: string[] = []
  let isCompanyOwner  = false

  if (session?.user.role === 'company') {
    const cp = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    isCompanyOwner = cp?.id === id
  }

  if (session?.user.role === 'person') {
    const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (profile) {
      const existing = await prisma.review.findFirst({ where: { authorPersonId: profile.id, targetCompanyId: id } })
      canReview = !existing
      currentUserReviewIds = reviews.filter(r => r.authorPersonId === profile.id).map(r => r.id)
    }
  }

  const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm'

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Link href="/offers" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors mb-6">
            ← Oferty
          </Link>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex items-center justify-center font-black text-white text-2xl shrink-0"
              style={{ background: '#f97015' }}>
              {company.companyLogoUrl
                ? <img src={company.companyLogoUrl} alt={company.companyName} className="w-full h-full object-cover" />
                : company.companyName[0]
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>
                  {company.companyName}
                </h1>
                {company.verified && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">✓ Zweryfikowana</span>
                )}
              </div>
              <p className="text-sm text-gray-500">📍 {company.city}</p>
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-semibold hover:underline mt-1 inline-block" style={{ color: '#f97015' }}>
                  🌐 {company.website}
                </a>
              )}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={avg} size="sm" showValue />
                  <span className="text-sm text-gray-400">({reviews.length} opinii)</span>
                  <Link href="/ranking" className="text-xs font-semibold hover:underline" style={{ color: '#f97015' }}>Ranking →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* Opis */}
        {(company.description || company.nip) && (
          <div className={`${card} p-5 sm:p-6`}>
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>🏢</span>
              O firmie
            </h2>
            {company.description && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{company.description}</p>
            )}
            {company.nip && <p className="text-xs text-gray-400 mt-3">NIP: {company.nip}</p>}
          </div>
        )}

        {/* Oferty */}
        {company.jobOffers.length > 0 && (
          <div className={`${card} p-5 sm:p-6`}>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>📋</span>
              Aktywne oferty ({company.jobOffers.length})
            </h2>
            <div className="space-y-2">
              {company.jobOffers.map(offer => (
                <Link key={offer.id} href={`/offers/${offer.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all group">
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-sm">{offer.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {offer.city}</p>
                  </div>
                  {offer.salaryMin && (
                    <p className="font-bold text-sm shrink-0" style={{ color: '#f97015' }}>
                      {offer.salaryMin}+ zł/{SALARY_TYPE[offer.salaryType]}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Opinie */}
        <div className={`${card} p-5 sm:p-6`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>⭐</span>
              Opinie ({reviews.length})
            </h2>
            {reviews.length > 0 && <StarRating value={avg} size="sm" showValue />}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Brak opinii. Bądź pierwszy!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="p-4 rounded-xl border border-gray-100 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-gray-800 text-sm">
                          {review.authorPerson ? `${review.authorPerson.firstName} ${review.authorPerson.lastName}` : 'Anonimowy'}
                        </p>
                        <StarRating value={review.rating} size="sm" />
                        <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('pl-PL')}</span>
                      </div>
                      {review.jobOffer && <p className="text-xs text-gray-400 mb-1">📋 {review.jobOffer.title}</p>}
                      {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                    </div>
                    {currentUserReviewIds.includes(review.id) && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 shrink-0">Twoja</span>
                    )}
                  </div>

                  {review.companyReply ? (
                    <div className="p-3 rounded-xl border border-orange-100 bg-orange-50">
                      <p className="text-xs font-bold text-orange-700 mb-1">
                        🏢 {company.companyName}
                        {review.companyRepliedAt && (
                          <span className="font-normal text-orange-400 ml-2">{new Date(review.companyRepliedAt).toLocaleDateString('pl-PL')}</span>
                        )}
                      </p>
                      <p className="text-sm text-orange-800">{review.companyReply}</p>
                    </div>
                  ) : isCompanyOwner ? (
                    <CompanyReplyButton reviewId={review.id} />
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {canReview && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm font-bold text-gray-700 mb-3">Oceń tę firmę</p>
              <ReviewForm type="company" targetId={company.id} targetName={company.companyName} />
            </div>
          )}

          {!session && (
            <p className="text-sm text-gray-400 text-center pt-4">
              <Link href="/login" className="font-semibold hover:underline" style={{ color: '#f97015' }}>Zaloguj się</Link> aby ocenić firmę
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
