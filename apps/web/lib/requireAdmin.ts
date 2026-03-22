import { auth } from '@/auth.node'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'admin') redirect('/')
  return session
}
