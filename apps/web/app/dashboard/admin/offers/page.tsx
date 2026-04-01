import { prisma } from '@/lib/prisma'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminActionButton from '@/components/admin/AdminActionButton'
import AdminOffersSearch from './AdminOffersSearch'

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function AdminOffersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q?.toLowerCase() || ''
  const statusFilter = params.status || 'all'

  const offers = await prisma.jobOffer.findMany({
    include: {
      company: { select: { companyName: true } },
      person:  { select: { firstName: true, lastName: true } },
      _count:  { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const filtered = offers.filter(o => {
    const matchesSearch = !q ||
      o.title.toLowerCase().includes(q) ||
      o.city.toLowerCase().includes(q) ||
      (o.company?.companyName?.toLowerCase().includes(q)) ||
      (o.person && `${o.person.firstName} ${o.person.lastName}`.toLowerCase().includes(q))

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const ROLE_COLOR: Record<string, string> = { person: '#E8C547', company: '#60a5fa' }
  const ROLE_LABEL: Record<string, string> = { person: '👤 Osoba', company: '🏢 Firma' }

  const STATUS: Record<string, { label: string; color: string }> = {
    active:  { label: 'Aktywna',     color: '#34d399' },
    paused:  { label: 'Wstrzymana',  color: '#f59e0b' },
    closed:  { label: 'Zamknięta',   color: '#9ca3af' },
    expired: { label: 'Wygasła',     color: '#f87171' },
    blocked: { label: 'Zablokowana', color: '#ef4444' },
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1 text-white/40">Panel admina</p>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Oferty <span className="text-white/30">({filtered.length})</span>
        </h1>
      </div>

      <AdminOffersSearch />

      <div className="glass-card-dark overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Tytuł', 'Autor', 'Miasto', 'Status', 'Aplikacji', 'Data', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const author = o.company?.companyName ?? (o.person ? `${o.person.firstName} ${o.person.lastName}` : '—')
              const st = STATUS[o.status] ?? STATUS.closed
              const isBlocked = o.status === 'blocked'

              return (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-white max-w-[200px] truncate">{o.title}</td>
                  <td className="px-4 py-3 text-white/70">{author}</td>
                  <td className="px-4 py-3 text-white/50">{o.city}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${st.color}20`, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-[#E8C547]">
                    {o._count.applications}
                  </td>
                  <td className="px-4 py-3 text-white/40">
                    {new Date(o.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <AdminActionButton
                        endpoint={`/api/admin/offers/${o.id}/block`}
                        label={isBlocked ? 'Odblokuj' : 'Blokuj'}
                        body={{ blocked: !isBlocked }}
                        variant={isBlocked ? 'success' : 'warning'}
                      />
                      <AdminDeleteButton
                        endpoint={`/api/admin/offers/${o.id}`}
                        label="Usuń"
                        confirm={`Usunąć ofertę "${o.title}"?`}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
