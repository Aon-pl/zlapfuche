import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ApplyButton from './ApplyButton'
import StarRating from '@/components/StarRating'
import ReviewsList from '@/components/ReviewsList'
import ReviewForm from '@/components/ReviewForm'
import SaveOfferButton from '@/components/SaveOfferButton'
import DeleteOfferButton from '@/components/DeleteOfferButton'

interface Props { params: Promise<{ id: string }> }

const CATEGORY_LABELS: Record<string, string> = {
  warehouse: '📦 Magazyn', construction: '🏗️ Budowlanka',
  hospitality: '🍽️ Gastronomia', retail: '🛒 Handel',
  transport: '🚛 Transport', cleaning: '🧹 Sprzątanie',
  manufacturing: '⚙️ Produkcja', agriculture: '🌾 Rolnictwo',
  office: '💼 Biuro', other: '🔧 Inne',
}
const SALARY_TYPE: Record<string, string> = { hourly: 'godz.', daily: 'dzień', monthly: 'mies.' }

export default async function OfferDetailPage({ params }: Props) {
  const { id }    = await params
  const session   = await auth()

  const offer = await prisma.jobOffer.findUnique({
    where: { id },
    include: {
      company: true,
      person: { select: { id: true, firstName: true, lastName: true, city: true } },
    },
  })
  if (!offer) notFound()

  await prisma.jobOffer.update({ where: { id }, data: { viewsCount: { increment: 1 } } })

  let personProfileId:  string | null = null
  let companyProfileId: string | null = null
  let alreadyApplied = false

  if (session?.user.role === 'person') {
    const p = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (p) {
      personProfileId = p.id
      const ex = await prisma.application.findFirst({ where: { offerId: id, applicantId: p.id } })
      alreadyApplied = !!ex
    }
  }
  if (session?.user.role === 'company') {
    const c = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    if (c) companyProfileId = c.id
  }

  const isOfferOwner =
    (session?.user.role === 'company' && !!companyProfileId && companyProfileId === offer.companyId) ||
    (session?.user.role === 'person'  && !!personProfileId  && personProfileId  === offer.personId)

  let isSaved = false
  if (session?.user && !isOfferOwner) {
    if (session.user.role === 'person' && personProfileId) {
      const s = await prisma.savedOffer.findUnique({ where: { personId_offerId: { personId: personProfileId, offerId: id } } })
      isSaved = !!s
    } else if (session.user.role === 'company' && companyProfileId) {
      const s = await prisma.savedOffer.findUnique({ where: { companyId_offerId: { companyId: companyProfileId, offerId: id } } })
      isSaved = !!s
    }
  }

  let companyReviews: any[] = []
  let companyAvg = 0
  let canReviewCompany = false

  if (offer.company) {
    companyReviews = await prisma.review.findMany({
      where: { targetCompanyId: offer.company.id, type: 'person_reviews_company' },
      include: { authorPerson: { select: { firstName: true, lastName: true } }, jobOffer: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }, take: 5,
    })
    companyAvg = companyReviews.length
      ? Math.round((companyReviews.reduce((s, r) => s + r.rating, 0) / companyReviews.length) * 10) / 10
      : 0
    if (session?.user.role === 'person' && personProfileId) {
      const existing = await prisma.review.findFirst({
        where: { authorPersonId: personProfileId, targetCompanyId: offer.company.id },
      })
      canReviewCompany = !existing
    }
  }

  const salary = offer.salaryMin
    ? `${offer.salaryMin}${offer.salaryMax ? `–${offer.salaryMax}` : '+'} zł/${SALARY_TYPE[offer.salaryType]}`
    : null
  const author = offer.company?.companyName ?? (offer.person ? `${offer.person.firstName} ${offer.person.lastName}` : '')

  const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6'

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Link href="/offers" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors mb-6">
            ← Wróć do ofert
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(249,112,21,0.1)', color: '#f97015' }}>
                  {CATEGORY_LABELS[offer.category] ?? offer.category}
                </span>
                {offer.remote && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    🏠 Zdalna
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4" style={{ letterSpacing: '-0.02em' }}>
                {offer.title}
              </h1>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white text-lg shrink-0 overflow-hidden"
                  style={{ background: '#f97015' }}>
                  {offer.company?.companyLogoUrl
                    ? <img src={offer.company.companyLogoUrl} alt={author} className="w-full h-full object-cover" />
                    : author[0]
                  }
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {offer.company
                      ? <Link href={`/companies/${offer.company.id}`} className="font-bold text-gray-900 hover:text-orange-500 transition-colors">{author}</Link>
                      : offer.person
                        ? <Link href={`/persons/${offer.person.id}`} className="font-bold text-gray-900 hover:text-orange-500 transition-colors">{author}</Link>
                        : <span className="font-bold text-gray-900">{author}</span>
                    }
                    {offer.company && companyReviews.length > 0 && (
                      <div className="flex items-center gap-1">
                        <StarRating value={companyAvg} size="sm" showValue />
                        <span className="text-xs text-gray-400">({companyReviews.length})</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">📍 {offer.city}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {[
                  offer.drivingLicense && '🚗 Prawo jazdy',
                  offer.minAge > 18 && `🔞 Min. ${offer.minAge} lat`,
                  offer.hoursPerWeek && `⏰ ${offer.hoursPerWeek}h/tyg.`,
                  `👁️ ${offer.viewsCount} wyświetleń`,
                ].filter(Boolean).map(tag => (
                  <span key={String(tag)} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {salary && (
              <div className="rounded-2xl px-6 py-5 text-center shrink-0 border border-orange-100"
                style={{ background: 'rgba(249,112,21,0.05)' }}>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Wynagrodzenie</p>
                <p className="text-3xl font-black" style={{ color: '#f97015', letterSpacing: '-0.02em' }}>{salary}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Left */}
        <div className="sm:col-span-2 space-y-4">
          {[
            { icon: '📋', title: 'Opis stanowiska', content: offer.description },
            offer.requirements ? { icon: '✅', title: 'Wymagania', content: offer.requirements } : null,
            offer.company?.description ? { icon: '🏢', title: 'O firmie', content: offer.company.description, extra: offer.company.website } : null,
          ].filter(Boolean).map((s: any) => (
            <div key={s.title} className={card}>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{ background: 'rgba(249,112,21,0.1)' }}>{s.icon}</span>
                {s.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
              {s.extra && (
                <a href={s.extra} target="_blank" rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
                  style={{ color: '#f97015' }}>
                  🌐 Odwiedź stronę
                </a>
              )}
            </div>
          ))}

          {offer.company && (
            <div className={card}>
              <ReviewsList reviews={companyReviews} avg={companyAvg} count={companyReviews.length} title="Opinie o firmie" />
              {companyReviews.length > 5 && (
                <Link href={`/companies/${offer.company.id}/reviews`}
                  className="mt-3 inline-block text-sm font-semibold hover:underline" style={{ color: '#f97015' }}>
                  Zobacz wszystkie →
                </Link>
              )}
              {canReviewCompany && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ReviewForm type="company" targetId={offer.company.id} targetName={offer.company.companyName} jobOfferId={offer.id} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-3">
          {offer.status === 'active' && !isOfferOwner && (
            <ApplyButton offerId={offer.id} personProfileId={personProfileId} isLoggedIn={!!session} alreadyApplied={alreadyApplied} />
          )}

          {session?.user && !isOfferOwner && (session.user.role === 'person' || session.user.role === 'company') && (
            <SaveOfferButton offerId={offer.id} initialSaved={isSaved} isLoggedIn={true} />
          )}

          {isOfferOwner && (
            <>
              <Link href={`/offers/${offer.id}/edit`}
                className="flex items-center justify-center gap-2 w-full font-semibold px-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white hover:border-orange-300 transition-all text-gray-700">
                ✏️ Edytuj ofertę
              </Link>
              <DeleteOfferButton offerId={offer.id} />
            </>
          )}

          <div className={card}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Szczegóły</h3>
            <div className="space-y-3">
              {[
                { label: 'Start', value: new Date(offer.startDate).toLocaleDateString('pl-PL') },
                offer.endDate ? { label: 'Koniec', value: new Date(offer.endDate).toLocaleDateString('pl-PL') } : null,
                { label: 'Miasto', value: offer.city },
                offer.hoursPerWeek ? { label: 'Godziny', value: `${offer.hoursPerWeek}h/tyg.` } : null,
                { label: 'Aplikacje', value: String(offer.applicationsCount) },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-center text-gray-400">
            Wygasa: {new Date(offer.expiresAt).toLocaleDateString('pl-PL')}
          </p>
        </div>
      </div>
    </div>
  )
}
