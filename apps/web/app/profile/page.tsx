import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import PersonProfilePage from './person'
import CompanyProfilePage from './company'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      personProfile: true,
      companyProfile: true,
    },
  })

  if (!user) redirect('/login')

  if (user.role === 'person') {
    return <PersonProfilePage user={user} />
  }

  return <CompanyProfilePage user={user} />
}
