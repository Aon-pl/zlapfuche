import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReviewForm from '@/components/ReviewForm'

export default async function PersonDashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'person') redirect('/dashboard')

  const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) redirect('/profile')

  const [applications, myOffers, notifications, savedOffers] = await Promise.all([
    prisma.application.findMany({
      where: { applicantId: profile.id },
      include: { offer: { include: { company: { select: { id: true, companyName: true, companyLogoUrl: true } }, person: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.jobOffer.findMany({
      where: { personId: profile.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.savedOffer.findMany({
      where: { personId: profile.id },
      include: { offer: { include: { company: { select: { companyName: true } }, person: { select: { firstName: true, lastName: true } } } } },
      orderBy: { createdAt: 'desc' }, take: 6,
    }),
  ])

  const reviewedKeys = (await prisma.review.findMany({
    where: { authorPersonId: profile.id, type: 'person_reviews_company' },
    select: { targetCompanyId: true, jobOfferId: true },
  })).map(r => `${r.targetCompanyId}_${r.jobOfferId}`)

  const unreadCount   = notifications.filter(n => !n.read).length
  const acceptedCount = applications.filter(a => a.status === 'accepted').length
  const pendingCount  = applications.filter(a => a.status === 'pending').length

  const STATUS: Record<string, { label: string; color: string; bg: string }> = {
    pending:  { label: 'Oczekująca',    color: '#d97706', bg: '#fef3c7' },
    viewed:   { label: 'Przejrzana',    color: '#2563eb', bg: '#dbeafe' },
    accepted: { label: 'Zaakceptowana', color: '#16a34a', bg: '#dcfce7' },
    rejected: { label: 'Odrzucona',     color: '#dc2626', bg: '#fee2e2' },
  }

  const card = 'bg-white rounded-2xl border border-gray-100 shadow-sm'

  return (
    <div style={{ background: '#FCFAF8', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Dashboard</p>
            <h1 className="text-2xl font-black text-gray-900" style={{ letterSpacing: '-0.02em' }}>
              {profile.firstName} {profile.lastName}
            </h1>
          </div>
          <div className="flex items-center gap-3">
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
            { label: 'Aplikacji',        value: applications.length, color: '#1D212B', icon: '📨' },
            { label: 'Oczekujących',     value: pendingCount,        color: '#d97706', icon: '⏳' },
            { label: 'Zaakceptowanych',  value: acceptedCount,       color: '#16a34a', icon: '✅' },
            { label: 'Zapisanych ofert', value: savedOffers.length,  color: '#f97015', icon: '★' },
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
          <div className="lg:col-span-2 space-y-5">

            {/* Aplikacje */}
            <div className="flex items-center justify-between">
              <h2 className="font-black text-gray-900">Moje aplikacje</h2>
              <Link href="/offers" className="text-xs font-semibold hover:underline" style={{ color: '#f97015' }}>
                Szukaj ofert →
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className={`${card} p-10 text-center`}>
                <p className="text-4xl mb-3">📭</p>
                <p className="font-bold text-gray-900 mb-1">Brak aplikacji</p>
                <p className="text-sm text-gray-500 mb-4">Zacznij aplikować na oferty pracy</p>
                <Link href="/offers"
                  className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                  style={{ background: '#f97015' }}>
                  Przeglądaj oferty
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map(app => {
                  const st      = STATUS[app.status] ?? STATUS.pending
                  const company = app.offer.company
                  const author  = company?.companyName ?? (app.offer.person ? `${app.offer.person.firstName} ${app.offer.person.lastName}` : '')
                  const canReview = company && !reviewedKeys.includes(`${company.id}_${app.offerId}`)

                  return (
                    <div key={app.id} className={`${card} overflow-hidden`}>
                      <div className="p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 overflow-hidden"
                          style={{ background: '#f97015' }}>
                          {company?.companyLogoUrl
                            ? <img src={company.companyLogoUrl} alt={author} className="w-full h-full object-cover" />
                            : author[0]
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/offers/${app.offerId}`}
                            className="font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-1 text-sm">
                            {app.offer.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {author} · 📍 {app.offer.city} · {new Date(app.createdAt).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                        <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      {canReview && company && (
                        <div className="px-4 py-3 border-t border-gray-50 bg-orange-50/50">
                          <p className="text-xs font-semibold mb-2" style={{ color: '#f97015' }}>⭐ Oceń pracodawcę:</p>
                          <ReviewForm type="company" targetId={company.id} targetName={company.companyName} jobOfferId={app.offerId} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Zapisane oferty */}
            {savedOffers.length > 0 && (
              <>
                <h2 className="font-black text-gray-900 pt-2">Zapisane oferty</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedOffers.map(saved => {
                    const author = saved.offer.company?.companyName
                      ?? (saved.offer.person ? `${saved.offer.person.firstName} ${saved.offer.person.lastName}` : '')
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
                          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl border text-orange-600 border-orange-200 bg-orange-50">
                          →
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Moje oferty */}
            <div className="flex items-center justify-between pt-2">
              <h2 className="font-black text-gray-900">Moje oferty</h2>
            </div>
            {myOffers.length === 0 ? (
              <div className={`${card} p-6 text-center`}>
                <p className="text-sm text-gray-500 mb-3">Nie dodałeś jeszcze żadnej oferty.</p>
                <Link href="/offers/new"
                  className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl text-white"
                  style={{ background: '#f97015' }}>
                  + Dodaj ofertę
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myOffers.map(offer => (
                  <div key={offer.id} className={`${card} p-4 flex items-start justify-between gap-3`}>
                    <div className="min-w-0">
                      <Link href={`/offers/${offer.id}`}
                        className="font-semibold text-gray-900 hover:text-orange-500 transition-colors line-clamp-1 text-sm">
                        {offer.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">📍 {offer.city} · {offer._count.applications} aplikacji</p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
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
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="space-y-4">

            {/* Profil */}
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 text-sm">Mój profil</h3>
                <Link href="/profile" className="text-xs font-semibold hover:underline" style={{ color: '#f97015' }}>Edytuj →</Link>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Imię i nazwisko', value: `${profile.firstName} ${profile.lastName}` },
                  { label: 'Miasto',          value: profile.city ?? '—' },
                  { label: 'Doświadczenie',   value: `${profile.experienceYears} lat` },
                  { label: 'Dostępny od',     value: profile.availableFrom ? new Date(profile.availableFrom).toLocaleDateString('pl-PL') : '—' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-semibold text-gray-900 text-right max-w-[55%] truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Powiadomienia */}
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
