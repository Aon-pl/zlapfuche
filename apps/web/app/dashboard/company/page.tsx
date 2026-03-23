import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReviewForm from '@/components/ReviewForm'

export default async function CompanyDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'company') redirect('/dashboard')

  const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect('/profile')

  const [offers, notifications, savedOffers] = await Promise.all([
    prisma.jobOffer.findMany({
      where: { companyId: profile.id },
      include: { _count: { select: { applications: true } }, applications: { include: { applicant: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.savedOffer.findMany({
      where: { companyId: profile.id },
      include: { offer: { include: { company: { select: { companyName: true } }, person: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' }, take: 6,
    }),
  ])

  const reviewedKeys = (await prisma.review.findMany({
    where: { authorCompanyId: profile.id, type: 'company_reviews_person' },
    select: { targetPersonId: true, jobOfferId: true },
  })).map(r => `${r.targetPersonId}_${r.jobOfferId}`)

  const activeOffers  = offers.filter(o => o.status === 'active').length
  const totalApps     = offers.reduce((s, o) => s + o._count.applications, 0)
  const totalAccepted = offers.reduce((s, o) => s + o.applications.filter(a => a.status === 'accepted').length, 0)
  const unreadCount   = notifications.filter(n => !n.read).length

  const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    active:  { label: 'Aktywna',     color: '#16a34a', bg: '#dcfce7' },
    paused:  { label: 'Wstrzymana',  color: '#d97706', bg: '#fef3c7' },
    closed:  { label: 'Zamknięta',   color: '#6b7280', bg: '#f3f4f6' },
    expired: { label: 'Wygasła',     color: '#dc2626', bg: '#fee2e2' },
    blocked: { label: 'Zablokowana', color: '#dc2626', bg: '#fee2e2' },
  }

  const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm'

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-black text-white text-xl shrink-0"
              style={{ background: '#f97015' }}>
              {profile.companyLogoUrl
                ? <img src={profile.companyLogoUrl} alt={profile.companyName} className="w-full h-full object-cover" />
                : profile.companyName[0]
              }
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>{profile.companyName}</h1>
                {profile.verified && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Zweryfikowana</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">📍 {profile.city}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/account"
              className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 bg-white hover:border-orange-300 transition-all text-gray-600">
              ⚙️ Konto
            </Link>
            <Link href="/offers/new"
              className="text-sm font-bold px-5 py-2 rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: '#f97015' }}>
              + Dodaj ofertę
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Aktywne oferty',       value: activeOffers,        color: '#f97015', icon: '📋' },
            { label: 'Wszystkich aplikacji', value: totalApps,           color: '#1D212B', icon: '📨' },
            { label: 'Zaakceptowanych',      value: totalAccepted,       color: '#16a34a', icon: '✅' },
            { label: 'Zapisanych ofert',     value: savedOffers.length,  color: '#d97706', icon: '★'  },
          ].map(s => (
            <div key={s.label} className={`${card} p-4 sm:p-5`}>
              <p className="text-xl mb-2">{s.icon}</p>
              <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-black text-gray-900">Moje oferty ({offers.length})</h2>

            {offers.length === 0 ? (
              <div className={`${card} p-10 text-center`}>
                <p className="text-5xl mb-3">🏢</p>
                <p className="font-bold text-gray-900 mb-1">Brak ofert</p>
                <p className="text-sm text-gray-500 mb-4">Dodaj pierwszą ofertę i zacznij rekrutować</p>
                <Link href="/offers/new"
                  className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                  style={{ background: '#f97015' }}>
                  + Dodaj ofertę
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map(offer => {
                  const st           = STATUS[offer.status] ?? STATUS.active
                  const acceptedApps = offer.applications.filter(a => a.status === 'accepted')
                  const pendingApps  = offer.applications.filter(a => a.status === 'pending')

                  return (
                    <div key={offer.id} className={`${card} overflow-hidden`}>
                      <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/offers/${offer.id}`}
                              className="font-bold text-gray-900 hover:text-orange-500 transition-colors text-sm sm:text-base">
                              {offer.title}
                            </Link>
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                              style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {offer.city} · {new Date(offer.createdAt).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-center hidden sm:block">
                            <p className="text-xl font-black" style={{ color: '#f97015' }}>{offer._count.applications}</p>
                            <p className="text-xs text-gray-400">aplikacji</p>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Link href={`/offers/${offer.id}/applications`}
                              className="text-xs font-bold px-3 py-1.5 rounded-xl text-orange-600 border border-orange-200 bg-orange-50">
                              Aplikacje →
                            </Link>
                            <Link href={`/offers/${offer.id}/edit`}
                              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-gray-500 border border-gray-200 bg-white text-center">
                              ✏️ Edytuj
                            </Link>
                          </div>
                        </div>
                      </div>

                      {pendingApps.length > 0 && (
                        <div className="px-4 sm:px-5 py-3 border-t border-gray-50 bg-yellow-50/50">
                          <p className="text-xs font-semibold mb-2 text-yellow-700">
                            ⏳ {pendingApps.length} nowych aplikacji
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {pendingApps.slice(0, 4).map(app => (
                              <Link key={app.applicantId} href={`/persons/${app.applicant.id}`}
                                className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white border border-gray-200 text-gray-700 hover:border-orange-300 transition-colors">
                                {app.applicant.firstName} {app.applicant.lastName}
                              </Link>
                            ))}
                            {pendingApps.length > 4 && (
                              <span className="text-xs font-bold text-yellow-600">+{pendingApps.length - 4} więcej</span>
                            )}
                          </div>
                        </div>
                      )}

                      {acceptedApps.length > 0 && (
                        <div className="px-4 sm:px-5 py-4 border-t border-gray-50 space-y-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                            Zaakceptowani ({acceptedApps.length})
                          </p>
                          {acceptedApps.map(app => {
                            const key      = `${app.applicant.id}_${offer.id}`
                            const reviewed = reviewedKeys.includes(key)
                            const name     = `${app.applicant.firstName} ${app.applicant.lastName}`
                            return (
                              <div key={app.applicantId} className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
                                      style={{ background: '#f97015' }}>{name[0]}</div>
                                    <Link href={`/persons/${app.applicant.id}`}
                                      className="font-semibold text-sm text-gray-900 hover:text-orange-500 transition-colors">{name}</Link>
                                  </div>
                                  {reviewed && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Oceniono</span>
                                  )}
                                </div>
                                {!reviewed && (
                                  <ReviewForm type="person" targetId={app.applicant.id} targetName={name} jobOfferId={offer.id} />
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Zapisane */}
            {savedOffers.length > 0 && (
              <>
                <h2 className="font-black text-gray-900 pt-2">Zapisane oferty</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedOffers.map(saved => {
                    const author = saved.offer.company?.companyName ?? (saved.offer.person ? `${saved.offer.person.firstName} ${saved.offer.person.lastName}` : '')
                    return (
                      <div key={saved.id} className={`${card} p-4 flex items-start justify-between gap-3`}>
                        <div className="min-w-0">
                          <Link href={`/offers/${saved.offerId}`}
                            className="font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-1 text-sm">
                            {saved.offer.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">{author} · 📍 {saved.offer.city}</p>
                        </div>
                        <Link href={`/offers/${saved.offerId}`}
                          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-orange-600 border border-orange-200 bg-orange-50">→</Link>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right */}
          <div className="space-y-4">
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm">Profil firmy</h3>
                <Link href="/profile" className="text-xs font-semibold hover:underline" style={{ color: '#f97015' }}>Edytuj →</Link>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Nazwa',  value: profile.companyName },
                  { label: 'Miasto', value: profile.city },
                  { label: 'NIP',    value: profile.nip ?? '—' },
                  { label: 'Strona', value: profile.website ?? '—' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[55%] truncate">{item.value}</span>
                  </div>
                ))}
              </div>
              <Link href={`/companies/${profile.id}`}
                className="mt-4 flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 hover:border-orange-300 transition-all text-gray-600">
                🏢 Podgląd profilu
              </Link>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  Powiadomienia
                  {unreadCount > 0 && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">{unreadCount}</span>
                  )}
                </h3>
                <Link href="/notifications" className="text-xs font-semibold hover:underline" style={{ color: '#f97015' }}>Wszystkie →</Link>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-center py-4 text-gray-400">Brak powiadomień</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 rounded-xl text-sm ${n.read ? 'bg-gray-50' : 'bg-orange-50 border border-orange-100'}`}>
                      <p className={`font-semibold ${n.read ? 'text-gray-500' : 'text-gray-900'}`}>{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
