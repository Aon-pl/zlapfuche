'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth.node'
import { revalidatePath } from 'next/cache'

// ── Tworzenie powiadomień ─────────────────────────────────

export async function createNotification({
  userId,
  title,
  message,
  type,
  data,
}: {
  userId: string
  title: string
  message: string
  type: 'new_application' | 'status_change' | 'offer_expiring' | 'new_offer'
  data?: Record<string, string>
}) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data ? JSON.stringify(data) : null,
      },
    })
  } catch (error) {
    console.error('Create notification error:', error)
  }
}

// Powiadomienie: nowa aplikacja (dla właściciela oferty)
export async function notifyNewApplication(applicationId: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      applicant: true,
      offer: {
        include: {
          company: { include: { user: true } },
          person:  { include: { user: true } },
        },
      },
    },
  })
  if (!app) return

  const ownerUserId = app.offer.company?.userId ?? app.offer.person?.userId
  if (!ownerUserId) return

  await createNotification({
    userId: ownerUserId,
    title: 'Nowa aplikacja',
    message: `${app.applicant.firstName} ${app.applicant.lastName} zaaplikował na ofertę "${app.offer.title}"`,
    type: 'new_application',
    data: { offerId: app.offer.id, applicationId: app.id },
  })
}

// Powiadomienie: zmiana statusu (dla aplikanta)
export async function notifyStatusChange(applicationId: string, newStatus: string) {
  const app = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      applicant: { include: { user: true } },
      offer: true,
    },
  })
  if (!app) return

  const statusLabels: Record<string, string> = {
    viewed:   'przejrzana',
    accepted: 'zaakceptowana',
    rejected: 'odrzucona',
  }
  const label = statusLabels[newStatus]
  if (!label) return

  await createNotification({
    userId: app.applicant.user.id,
    title: newStatus === 'accepted' ? '🎉 Aplikacja zaakceptowana!' : 'Aktualizacja aplikacji',
    message: `Twoja aplikacja na "${app.offer.title}" została ${label}.`,
    type: 'status_change',
    data: { offerId: app.offer.id, applicationId: app.id, status: newStatus },
  })
}

// ── Pobieranie i zarządzanie ──────────────────────────────

export async function getNotifications() {
  const session = await auth()
  if (!session?.user?.id) return []

  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function getUnreadCount() {
  const session = await auth()
  if (!session?.user?.id) return 0

  return prisma.notification.count({
    where: { userId: session.user.id, read: false },
  })
}

export async function markAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.notification.update({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  })
  revalidatePath('/', 'layout')
}

export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  })
  revalidatePath('/', 'layout')
}

export async function deleteNotification(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) return

  await prisma.notification.delete({
    where: { id: notificationId, userId: session.user.id },
  })
  revalidatePath('/', 'layout')
}
