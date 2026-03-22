import { prisma } from '@/lib/prisma'
import AdminDeleteButton from '@/components/admin/AdminDeleteButton'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { role: { not: 'admin' } },
    include: {
      personProfile:  { select: { firstName: true, lastName: true, city: true } },
      companyProfile: { select: { companyName: true, city: true, verified: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const card = { background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.055)' }
  const ROLE_COLOR: Record<string, string> = { person: '#E8C547', company: '#60a5fa' }
  const ROLE_LABEL: Record<string, string> = { person: '👤 Osoba', company: '🏢 Firma' }

  return (
    <div className="p-6 space-y-5">
      <div>
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Panel admina</p>
        <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
          Użytkownicy <span style={{ color: 'rgba(255,255,255,0.3)' }}>({users.length})</span>
        </h1>
      </div>

      <div className="rounded-2xl overflow-hidden" style={card}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Email', 'Nazwa', 'Rola', 'Miasto', 'Data rejestracji', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-black uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const name = u.personProfile
                ? `${u.personProfile.firstName} ${u.personProfile.lastName}`
                : u.companyProfile?.companyName ?? '—'
              const city = u.personProfile?.city ?? u.companyProfile?.city ?? '—'

              return (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{u.email}</td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${ROLE_COLOR[u.role]}20`, color: ROLE_COLOR[u.role] }}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{city}</td>
                  <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                  </td>
                  <td className="px-4 py-3">
                    <AdminDeleteButton
                      endpoint={`/api/admin/users/${u.id}`}
                      label="Usuń"
                      confirm={`Usunąć użytkownika ${u.email}? Operacja jest nieodwracalna.`}
                    />
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
