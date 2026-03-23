import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, getMobileUser } from '@/lib/apiHelpers'

export async function GET(req: NextRequest) {
  try {
    const user = await getMobileUser(req)
    if (!user) return apiError('Nie jesteś zalogowany.', 401)

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = notifications.filter(n => !n.read).length
    return apiSuccess({ notifications, unreadCount })
  } catch {
    return apiError('Błąd serwera.', 500)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getMobileUser(req)
    if (!user) return apiError('Nie jesteś zalogowany.', 401)

    const { id, markAll } = await req.json()

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data:  { read: true },
      })
    } else if (id) {
      await prisma.notification.update({
        where: { id, userId: user.id },
        data:  { read: true },
      })
    }

    return apiSuccess({ message: 'Zaktualizowano.' })
  } catch {
    return apiError('Błąd serwera.', 500)
  }
}
