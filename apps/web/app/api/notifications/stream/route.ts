import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {}
      }

      // Wyślij od razu aktualne nieprzeczytane
      const unread = await prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 10,
      })

      send({ type: 'init', notifications: unread, count: unread.length })

      // Odpytuj bazę co 5 sekund w poszukiwaniu nowych
      let lastChecked = new Date()

      const interval = setInterval(async () => {
        try {
          const newNotifications = await prisma.notification.findMany({
            where: {
              userId,
              read: false,
              createdAt: { gt: lastChecked },
            },
            orderBy: { createdAt: 'desc' },
          })

          if (newNotifications.length > 0) {
            const totalUnread = await prisma.notification.count({
              where: { userId, read: false },
            })
            send({ type: 'new', notifications: newNotifications, count: totalUnread })
          }

          lastChecked = new Date()
        } catch {
          clearInterval(interval)
        }
      }, 5000)

      // Heartbeat co 30s żeby połączenie nie wygasło
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
          clearInterval(interval)
        }
      }, 30000)

      // Cleanup przy zamknięciu
      return () => {
        clearInterval(interval)
        clearInterval(heartbeat)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
