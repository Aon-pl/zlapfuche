import Link from 'next/link'
import { JobOffer, CATEGORY_LABELS, CATEGORY_ICONS, SALARY_TYPE_LABELS } from '@/types'

interface JobCardProps {
  offer: JobOffer
}

function formatSalary(offer: JobOffer): string {
  const type = SALARY_TYPE_LABELS[offer.salary_type]
  if (offer.salary_min && offer.salary_max) {
    return `${offer.salary_min}–${offer.salary_max} ${offer.currency}/${type}`
  }
  if (offer.salary_min) return `od ${offer.salary_min} ${offer.currency}/${type}`
  if (offer.salary_max) return `do ${offer.salary_max} ${offer.currency}/${type}`
  return 'Wynagrodzenie do uzgodnienia'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'przed chwilą'
  if (hours < 24) return `${hours}h temu`
  if (days === 1) return 'wczoraj'
  if (days < 7) return `${days} dni temu`
  return new Date(dateStr).toLocaleDateString('pl-PL')
}

export default function JobCard({ offer }: JobCardProps) {
  const employer = offer.employer_profiles

  return (
    <Link href={`/offers/${offer.id}`} className="group block">
      <article className="
        relative bg-white border border-slate-200 rounded-2xl p-6
        hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50
        transition-all duration-200 cursor-pointer
      ">

        {/* Nagłówek */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo firmy lub placeholder */}
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {employer?.company_logo_url ? (
                <img
                  src={employer.company_logo_url}
                  alt={employer.company_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl">{CATEGORY_ICONS[offer.category]}</span>
              )}
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors truncate">
                {offer.title}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-sm text-slate-500 truncate">
                  {employer?.company_name ?? 'Firma'}
                </span>
                {employer?.verified && (
                  <span title="Zweryfikowana firma" className="text-blue-500 text-xs">✓</span>
                )}
              </div>
            </div>
          </div>

          {/* Wynagrodzenie */}
          <div className="flex-shrink-0 text-right">
            <span className="text-sm font-semibold text-emerald-600 whitespace-nowrap">
              {formatSalary(offer)}
            </span>
          </div>
        </div>

        {/* Tagi */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
            {CATEGORY_ICONS[offer.category]} {CATEGORY_LABELS[offer.category]}
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
            📍 {offer.city}
          </span>
          {offer.remote && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
              🏠 Zdalnie
            </span>
          )}
          {offer.driving_license && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
              🚗 Prawo jazdy
            </span>
          )}
          {offer.hours_per_week && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
              🕐 {offer.hours_per_week}h/tydzień
            </span>
          )}
        </div>

        {/* Stopka */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>👁 {offer.views_count}</span>
            <span>📩 {offer.applications_count} aplikacji</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{timeAgo(offer.created_at)}</span>
            <span className="
              text-xs font-medium px-2 py-0.5 rounded-full
              bg-emerald-50 text-emerald-700
            ">
              Od {new Date(offer.start_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

      </article>
    </Link>
  )
}
