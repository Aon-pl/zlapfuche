import { prisma } from '@/lib/prisma'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import StarRating from '@/components/StarRating'

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      authorPerson:  { select: { firstName: true, lastName: true } },
      authorCompany: { select: { companyName: true } },
      targetPerson:  { select: { firstName: true, lastName: true } },
      targetCompany: { select: { companyName: true } },
      jobOffer:      { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const TYPE_LABEL: Record<string, string> = {
    person_reviews_company:  'Osoba → Firma',
    company_reviews_person:  'Firma → Osoba',
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1 text-white/40">Panel admina</p>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Opinie <span className="text-white/30">({reviews.length})</span>
        </h1>
      </div>

      <div className="space-y-3">
        {reviews.map(r => {
          const author = r.authorPerson
            ? `${r.authorPerson.firstName} ${r.authorPerson.lastName}`
            : r.authorCompany?.companyName ?? '—'
          const target = r.targetPerson
            ? `${r.targetPerson.firstName} ${r.targetPerson.lastName}`
            : r.targetCompany?.companyName ?? '—'

          return (
            <div key={r.id} className="glass-card-dark p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                    {TYPE_LABEL[r.type] ?? r.type}
                  </span>
                  <StarRating value={r.rating} size="sm" showValue />
                  <span className="text-xs text-white/40">
                    {new Date(r.createdAt).toLocaleDateString('pl-PL')}
                  </span>
                </div>
                <p className="text-sm font-bold text-white">
                  {author} → {target}
                </p>
                {r.jobOffer && (
                  <p className="text-xs mt-0.5 text-white/50">
                    📋 {r.jobOffer.title}
                  </p>
                )}
                {r.comment && (
                  <p className="text-sm mt-2 leading-relaxed text-white/70">
                    {r.comment}
                  </p>
                )}
              </div>
              <AdminDeleteButton
                endpoint={`/api/admin/reviews/${r.id}`}
                label="Usuń"
                confirm="Usunąć tę opinię?"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
