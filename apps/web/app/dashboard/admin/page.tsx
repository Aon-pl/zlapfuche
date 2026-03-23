import { prisma } from '@/lib/prisma'

export default async function AdminDashboardPage() {
  const [
    totalUsers, totalPersons, totalCompanies,
    totalOffers, activeOffers,
    totalApplications, totalReviews,
    recentUsers, recentOffers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'person' } }),
    prisma.user.count({ where: { role: 'company' } }),
    prisma.jobOffer.count(),
    prisma.jobOffer.count({ where: { status: 'active' } }),
    prisma.application.count(),
    prisma.review.count(),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, email: true, role: true, createdAt: true } }),
    prisma.jobOffer.findMany({
      orderBy: { createdAt: 'desc' }, take: 5,
      include: { company: { select: { companyName: true } }, person: { select: { firstName: true, lastName: true } } },
    }),
  ])

  const card = { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.055)' }

  const ROLE_LABEL: Record<string, string> = { person: '👤 Osoba', company: '🏢 Firma', admin: '⚙️ Admin' }
  const ROLE_COLOR: Record<string, string> = { person: '#E8C547', company: '#60a5fa', admin: '#34d399' }

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Panel admina</p>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Statystyki</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Użytkowników',  value: totalUsers,        icon: '👥', color: '#fff'    },
          { label: 'Osób',          value: totalPersons,      icon: '👤', color: '#E8C547' },
          { label: 'Firm',          value: totalCompanies,    icon: '🏢', color: '#60a5fa' },
          { label: 'Ofert',         value: totalOffers,       icon: '📋', color: '#fff'    },
          { label: 'Aktywnych ofert',value: activeOffers,     icon: '✅', color: '#34d399' },
          { label: 'Aplikacji',     value: totalApplications, icon: '📨', color: '#f59e0b' },
          { label: 'Opinii',        value: totalReviews,      icon: '⭐', color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5" style={card}>
            <p className="text-xl mb-3">{s.icon}</p>
            <p className="text-3xl font-black" style={{ color: s.color, letterSpacing: '-0.02em' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Recent users */}
        <div className="rounded-2xl p-5" style={card}>
          <h2 className="font-black text-white text-sm mb-4">Ostatnio zarejestrowani</h2>
          <div className="space-y-2">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <p className="text-sm font-semibold text-white">{u.email}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: `${ROLE_COLOR[u.role]}20`, color: ROLE_COLOR[u.role] }}>
                  {ROLE_LABEL[u.role]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent offers */}
        <div className="rounded-2xl p-5" style={card}>
          <h2 className="font-black text-white text-sm mb-4">Ostatnio dodane oferty</h2>
          <div className="space-y-2">
            {recentOffers.map(o => {
              const author = o.company?.companyName ?? (o.person ? `${o.person.firstName} ${o.person.lastName}` : '—')
              return (
                <div key={o.id} className="flex items-center justify-between py-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{o.title}</p>
                    <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{author} · {o.city}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ml-3"
                    style={{ background: o.status === 'active' ? 'rgba(52,211,153,0.1)' : 'rgba(156,163,175,0.1)',
                             color: o.status === 'active' ? '#34d399' : '#9ca3af' }}>
                    {o.status === 'active' ? 'Aktywna' : o.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
