import { prisma } from '@/lib/prisma'
import AdminUsersTable from './AdminUsersTable'

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; status?: string }>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams
  const q = params.q?.toLowerCase() || ''
  const roleFilter = params.role || 'all'
  const statusFilter = params.status || 'all'

  const users = await prisma.user.findMany({
    where: { role: { not: 'admin' } },
    include: {
      personProfile: { select: { firstName: true, lastName: true, city: true } },
      companyProfile: { select: { companyName: true, city: true, verified: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const filtered = users.filter(u => {
    const name = u.personProfile
      ? `${u.personProfile.firstName} ${u.personProfile.lastName}`
      : u.companyProfile?.companyName ?? ''
    const city = u.personProfile?.city ?? u.companyProfile?.city ?? ''

    const matchesSearch = !q ||
      u.email.toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      city.toLowerCase().includes(q)

    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !u.blocked) ||
      (statusFilter === 'blocked' && u.blocked)

    return matchesSearch && matchesRole && matchesStatus
  })

  return <AdminUsersTable users={filtered} total={users.length} />
}
