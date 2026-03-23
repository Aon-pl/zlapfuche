import { auth } from '@/auth.node'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  if (session.user.role === 'person')  redirect('/dashboard/person')
  if (session.user.role === 'company') redirect('/dashboard/company')
  if (session.user.role === 'admin')   redirect('/dashboard/admin')

  redirect('/login')
}