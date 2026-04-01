import { auth } from '@/auth.node'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen flex"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        backgroundAttachment: 'fixed',
      }}>
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}
