import { prisma } from '@/lib/prisma'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'
import AdminActionButton from '@/components/admin/AdminActionButton'

export default async function AdminOffersPage() {
  const offers = await prisma.jobOffer.findMany({
    include: {
      company: { select: { companyName: true } },
      person:  { select: { firstName: true, lastName: true } },
      _count:  { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const card = { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.055)' }

  const STATUS: Record<string, { label: string; color: string }> = {
    active:  { label: 'Aktywna',     color: '#34d399' },
    paused:  { label: 'Wstrzymana',  color: '#f59e0b' },
    closed:  { label: 'Zamknięta',   color: '#9ca3af' },
    expired: { label: 'Wygasła',     color: '#f87171' },
    blocked: { label: 'Zablokowana', color: '#ef4444' },
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Panel admina</p>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Oferty <span style={{ color: 'rgba(255,255,255,0.3)' }}>({offers.length})</span>
        </h1>
      </div>

      <div className="rounded-2xl overflow-hidden" style={card}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Tytuł', 'Autor', 'Miasto', 'Status', 'Aplikacji', 'Data', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {offers.map(o => {
              const author = o.company?.companyName ?? (o.person ? `${o.person.firstName} ${o.person.lastName}` : '—')
              const st = STATUS[o.status] ?? STATUS.closed
              const isBlocked = o.status === 'blocked'

              return (
                <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-semibold text-white max-w-[200px] truncate">{o.title}</td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.6)' }}>{author}</td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{o.city}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${st.color}20`, color: st.color }}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold" style={{ color: '#E8C547' }}>
                    {o._count.applications}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
