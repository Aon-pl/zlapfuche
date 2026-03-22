import { auth } from '@/auth.node'
import NavClient from '@/components/NavClient'

export default async function Navbar() {
  const session = await auth()
  const user    = session?.user

  return (
    <NavClient
      role={(user?.role ?? null) as 'person' | 'company' | 'admin' | null}
      email={user?.email ?? undefined}
    />
  )
}
