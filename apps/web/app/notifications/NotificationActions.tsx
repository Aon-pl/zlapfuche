'use client'

import { useRouter } from 'next/navigation'
import { markAllAsRead } from '@/app/actions/notifications'

export default function NotificationActions() {
  const router = useRouter()

  async function handleMarkAll() {
    await markAllAsRead()
    router.refresh()
  }

  return (
    <button
      onClick={handleMarkAll}
      className="px-4 py-2 border border-zinc-700 hover:border-zinc-600 text-zinc-400 hover:text-white text-sm rounded-xl transition-all"
    >
      Oznacz wszystkie jako przeczytane
    </button>
  )
}
