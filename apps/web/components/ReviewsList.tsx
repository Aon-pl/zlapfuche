import StarRating from './StarRating'
import EditDeleteReviewButtons from './EditDeleteReviewButtons'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: Date
  authorPerson?:  { firstName: string; lastName: string } | null
  authorCompany?: { companyName: string } | null
  jobOffer?:      { title: string } | null
}

interface ReviewsListProps {
  reviews: Review[]
  avg: number
  count: number
  title?: string
  currentUserReviewIds?: string[]
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'dzisiaj'
  if (days === 1) return 'wczoraj'
  if (days < 30) return `${days} dni temu`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mies. temu`
  return `${Math.floor(months / 12)} lat temu`
}

export default function ReviewsList({ reviews, avg, count, title = 'Opinie', currentUserReviewIds = [] }: ReviewsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={avg} size="sm" showValue />
            <span className="text-sm text-gray-400">({count} {count === 1 ? 'opinia' : count < 5 ? 'opinie' : 'opinii'})</span>
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-black text-gray-900">{avg.toFixed(1)}</p>
            <StarRating value={avg} size="sm" />
          </div>
          <div className="flex-1 space-y-1">
            {[5,4,3,2,1].map(star => {
              const starCount = reviews.filter(r => r.rating === star).length
              const pct = count > 0 ? (starCount / count) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-3">{star}</span>
                  <span className="text-yellow-400">★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-right">{starCount}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Brak opinii</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => {
            const author = review.authorPerson
              ? `${review.authorPerson.firstName} ${review.authorPerson.lastName}`
              : review.authorCompany?.companyName ?? 'Anonim'
            const isOwn = currentUserReviewIds.includes(review.id)

            return (
              <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-800">{author}</p>
                      {isOwn && <span className="text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">Twoja opinia</span>}
                    </div>
                    {review.jobOffer && (
                      <p className="text-xs text-gray-400">dot. oferty: {review.jobOffer.title}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <StarRating value={review.rating} size="sm" />
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(review.createdAt)}</p>
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed mt-2">{review.comment}</p>
                )}

                {isOwn && (
                  <EditDeleteReviewButtons
                    reviewId={review.id}
                    initialRating={review.rating}
                    initialComment={review.comment}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
