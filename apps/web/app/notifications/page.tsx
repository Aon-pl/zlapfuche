import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import NotificationActions from './NotificationActions'

const TYPE_ICONS: Record<string, string> = {
  new_application: '📩',
  status_change:   '🔄',
  offer_expiring:  '⏰',
  new_offer:       '🆕',
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'przed chwilą'
  if (mins < 60)  return `${mins} min temu`
  if (hours < 24) return `${hours}h temu`
  return `${days} dni temu`
}

function getLink(data: string | null): string | null {
  if (!data) return null
  try {
    const parsed = JSON.parse(data)
    if (parsed.offerId && parsed.applicationId) return `/offers/${parsed.offerId}/applications`
    if (parsed.offerId) return `/offers/${parsed.offerId}`
  } catch {}
  return null
}

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-zinc-950">

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Powiadomienia</h1>
            {unreadCount > 0 && (
              <p className="text-zinc-400 text-sm mt-1">{unreadCount} nieprzeczytanych</p>
            )}
          </div>
          {unreadCount > 0 && (
            <NotificationActions />
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900 border border-zinc-800 rounded-2xl">
            <div className="text-5xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-white mb-2">Brak powiadomień</h3>
            <p className="text-zinc-400">Tutaj pojawią się powiadomienia o Twojej aktywności.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const link = getLink(n.data)
              const icon = TYPE_ICONS[n.type] ?? '🔔'

              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
                    !n.read
                      ? 'bg-yellow-400/5 border-yellow-400/20'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div className="flex-1 min-w-0">
                    {link ? (
                      <Link href={link} className="block group">
                        <p className={`font-bold ${n.read ? 'text-zinc-300' : 'text-white'} group-hover:text-yellow-400 transition-colors`}>
                          {n.title}
                        </p>
                        <p className="text-zinc-400 text-sm mt-0.5">{n.message}</p>
                      </Link>
                    ) : (
                      <>
                        <p className={`font-bold ${n.read ? 'text-zinc-300' : 'text-white'}`}>{n.title}</p>
                        <p className="text-zinc-400 text-sm mt-0.5">{n.message}</p>
                      </>
                    )}
                    <p className="text-zinc-600 text-xs mt-2">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 mt-2" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
