import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StarRating from '@/components/StarRating'
import ReviewForm from '@/components/ReviewForm'
import StartChatButton from '@/components/StartChatButton'

interface Props { params: Promise<{ id: string }> }

const CATEGORY_LABELS: Record<string, string> = {
  warehouse: 'Magazyn', construction: 'Budowlanka', hospitality: 'Gastronomia',
  transport: 'Transport', retail: 'Handel', manufacturing: 'Produkcja',
  cleaning: 'Sprzątanie', agriculture: 'Rolnictwo', office: 'Biuro', other: 'Inne',
}

export default async function PersonProfilePage({ params }: Props) {
  const { id }  = await params
  const session = await auth()

  const person = await prisma.personProfile.findUnique({
    where: { id },
    include: { jobOffers: { where: { status: 'active' }, orderBy: { createdAt: 'desc' }, take: 5 } },
  })
  if (!person) notFound()

  const reviews = await prisma.review.findMany({
    where: { targetPersonId: id, type: 'company_reviews_person' },
    include: { authorCompany: { select: { companyName: true } }, jobOffer: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  let canReview           = false
  let currentUserReviewIds: string[] = []
  let myPersonProfileId:   string | null = null
  let myCompanyProfileId:  string | null = null
  let canChatAsPerson     = false
  let canChatAsCompany    = false

  if (session?.user.role === 'company') {
    const cp = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    if (cp) {
      const acceptedApp = await prisma.application.findFirst({
        where: { applicantId: id, status: 'accepted', offer: { companyId: cp.id } },
      })
      const existing = await prisma.review.findFirst({ where: { authorCompanyId: cp.id, targetPersonId: id } })
      canReview = !!acceptedApp && !existing
      currentUserReviewIds = reviews.filter(r => r.authorCompanyId === cp.id).map(r => r.id)
      myCompanyProfileId = cp.id
      const app = await prisma.application.findFirst({ where: { applicantId: id, offer: { companyId: cp.id } } })
      canChatAsCompany = !!app
    }
  }

  if (session?.user.role === 'person') {
    const myProfile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (myProfile && myProfile.id !== id) {
      myPersonProfileId = myProfile.id
      canChatAsPerson = true
    }
  }

  const fullName = `${person.firstName} ${person.lastName}`
  const skills   = person.skills ? person.skills.split(',').map(s => s.trim()).filter(Boolean) : []
  const card     = 'bg-white rounded-2xl border border-gray-100 shadow-sm'

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black text-white text-2xl shrink-0"
              style={{ background: '#f97015' }}>
              {fullName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1" style={{ letterSpacing: '-0.02em' }}>
                {fullName}
              </h1>
              {person.city && <p className="text-sm text-gray-500">📍 {person.city}</p>}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={avg} size="sm" showValue />
                  <span className="text-sm text-gray-400">({reviews.length} opinii)</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {person.experienceYears > 0 && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    💼 {person.experienceYears} lat doświadczenia
                  </span>
                )}
                {person.availableFrom && (
                  <span className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">
                    ✅ od {new Date(person.availableFrom).toLocaleDateString('pl-PL')}
                  </span>
                )}
              </div>
              {(canChatAsPerson || canChatAsCompany) && (
                <div className="mt-3">
                  {canChatAsPerson && myPersonProfileId && (
                    <StartChatButton personId={myPersonProfileId} targetPersonId={id} label="Napisz wiadomość" />
                  )}
                  {canChatAsCompany && myCompanyProfileId && (
                    <StartChatButton personId={id} companyId={myCompanyProfileId} label="Napisz wiadomość" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* Bio + umiejętności */}
        {(person.bio || skills.length > 0 || person.cvUrl) && (
          <div className={`${card} p-5 sm:p-6`}>
            {person.bio && (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-4">{person.bio}</p>
            )}
            {skills.length > 0 && (
              <div className={person.bio ? 'pt-4 border-t border-gray-100' : ''}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Umiejętności</p>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <span key={skill} className="text-sm px-3 py-1.5 rounded-full font-semibold border"
                      style={{ background: 'rgba(249,112,21,0.08)', color: '#f97015', borderColor: 'rgba(249,112,21,0.2)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {person.cvUrl && (
              <a href={person.cvUrl} target="_blank" rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:border-orange-300 text-gray-600 transition-all">
                📄 Pobierz CV
              </a>
            )}
          </div>
        )}

        {/* Oferty */}
        {person.jobOffers.length > 0 && (
          <div className={`${card} p-5 sm:p-6`}>
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(249,112,21,0.1)' }}>📋</span>
              Wystawione oferty ({person.jobOffers.length})
            </h2>
            <div className="space-y-2">
              {person.jobOffers.map(offer => (
                <Link key={offer.id} href={`/offers/${offer.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all group">
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors text-sm">{offer.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">📍 {offer.city} · {CATEGORY_LABELS[offer.category]}</p>
                  </div>
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
            <p className="text-sm text-gray-400 text-center py-6">Brak opinii.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(review => (
                <div key={review.id} className="p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {review.authorCompany?.companyName ?? 'Firma'}
                    </p>
                    <StarRating value={review.rating} size="sm" />
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('pl-PL')}</span>
                  </div>
                  {review.jobOffer && <p className="text-xs text-gray-400 mb-1">📋 {review.jobOffer.title}</p>}
                  {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}

          {canReview && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <ReviewForm type="person" targetId={person.id} targetName={fullName} />
            </div>
          )}
          {!session && (
            <p className="text-sm text-gray-400 text-center pt-4">
              <Link href="/login" className="font-semibold hover:underline" style={{ color: '#f97015' }}>Zaloguj się</Link> aby ocenić
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
