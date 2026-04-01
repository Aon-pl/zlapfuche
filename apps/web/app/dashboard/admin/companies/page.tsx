import { prisma } from '@/lib/prisma'
import AdminActionButton from '@/components/admin/AdminActionButton'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'

export default async function AdminCompaniesPage() {
  const companies = await prisma.companyProfile.findMany({
    include: {
      user:      { select: { email: true, createdAt: true } },
      jobOffers: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const card = { background: 'rgba(30,30,50,0.6)', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1 text-white/40">Panel admina</p>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Firmy <span className="text-white/30">({companies.length})</span>
        </h1>
      </div>

      <div className="glass-card-dark overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Firma', 'Email', 'Miasto', 'NIP', 'Ofert', 'Weryfikacja', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest text-white/40">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-bold text-white">{c.companyName}</td>
                <td className="px-4 py-3 text-white/70">{c.user.email}</td>
                <td className="px-4 py-3 text-white/50">{c.city}</td>
                <td className="px-4 py-3 text-white/40">{c.nip ?? '—'}</td>
                <td className="px-4 py-3 text-center font-bold text-[#E8C547]">
                  {c.jobOffers.length}
                </td>
                <td className="px-4 py-3">
                  {c.verified
                    ? <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>✓ Zweryfikowana</span>
                    : <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>⏳ Oczekuje</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <AdminActionButton
                      endpoint={`/api/admin/companies/${c.id}/verify`}
                      label={c.verified ? 'Cofnij' : 'Weryfikuj'}
                      body={{ verified: !c.verified }}
                      variant={c.verified ? 'warning' : 'success'}
                    />
                    <AdminDeleteButton
                      endpoint={`/api/admin/users/${c.userId}`}
                      label="Usuń"
                      confirm={`Usunąć firmę ${c.companyName} i jej konto?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
