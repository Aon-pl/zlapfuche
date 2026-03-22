import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ReviewsList from '@/components/ReviewsList'
import ReviewForm from '@/components/ReviewForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CompanyReviewsPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const company = await prisma.companyProfile.findUnique({
    where: { id },
    select: { id: true, companyName: true, companyLogoUrl: true, city: true },
  })
  if (!company) notFound()

  const reviews = await prisma.review.findMany({
    where: { targetCompanyId: id, type: 'person_reviews_company' },
    include: {
      authorPerson: { select: { firstName: true, lastName: true } },
      jobOffer:     { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const avg = reviews.length
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0

  // Czy zalogowana osoba może wystawić ocenę
  let canReview = false
  let personProfileId = ''
  if (session?.user.role === 'person') {
    const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (profile) {
      personProfileId = profile.id
      const alreadyReviewed = await prisma.review.findFirst({
        where: { authorPersonId: profile.id, targetCompanyId: id, jobOfferId: null },
      })
      canReview = !alreadyReviewed
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

      {/* Nagłówek firmy */}
      <div className="flex items-center gap-4">
        {company.companyLogoUrl
          ? <img src={company.companyLogoUrl} alt={company.companyName} className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
          : <div className="w-16 h-16 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl font-black text-yellow-600">{company.companyName[0]}</div>
        }
        <div>
          <h1 className="text-2xl font-black text-slate-800">{company.companyName}</h1>
          <p className="text-slate-500">📍 {company.city}</p>
        </div>
      </div>

      {/* Formularz oceny */}
      {canReview && (
        <ReviewForm
          type="company"
          targetId={company.id}
          targetName={company.companyName}
        />
      )}

      {/* Lista opinii */}
      <ReviewsList
        reviews={reviews}
        avg={avg}
        count={reviews.length}
        title="Opinie o firmie"
      />

    </div>
  )
}
