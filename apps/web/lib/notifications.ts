import { prisma } from '@/lib/prisma'

// Nowa aplikacja — powiadom firmę/osobę wystawiającą ofertę
export async function notifyNewApplication(offerId: string, applicantName: string) {
  const offer = await prisma.jobOffer.findUnique({
    where: { id: offerId },
    include: {
      company: { select: { userId: true } },
      person:  { select: { userId: true } },
    },
  })
  if (!offer) return

  const targetUserId = offer.company?.userId ?? offer.person?.userId
  if (!targetUserId) return

  await prisma.notification.create({
    data: {
      userId:  targetUserId,
      title:   'Nowa aplikacja',
      message: `${applicantName} aplikował/a na Twoją ofertę "${offer.title}".`,
      type:    'INFO' // Dodane przykładowe pole type
    } as any,
  })
}

// Zmiana statusu aplikacji — powiadom osobę aplikującą
export async function notifyApplicationStatusChange(
  applicationId: string,
  newStatus: string
) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      applicant: { select: { userId: true } },
      offer:     { select: { title: true } },
    },
  })
  if (!application) return

  const STATUS_MESSAGES: Record<string, string> = {
    accepted: 'zaakceptowana ✅',
    rejected: 'odrzucona ❌',
    viewed:   'przejrzana 👀',
  }

  const statusLabel = STATUS_MESSAGES[newStatus] ?? newStatus

  await prisma.notification.create({
    data: {
      userId:  application.applicant.userId,
      title:   'Zmiana statusu aplikacji',
      message: `Twoja aplikacja na "${application.offer.title}" została ${statusLabel}.`,
      type:    'INFO' // Dodane przykładowe pole type
    } as any,
  })
}

// Nowa wiadomość — powiadom odbiorcę
export async function notifyNewMessage(conversationId: string, senderName: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      person:  { select: { userId: true } },
      company: { select: { userId: true } },
      personA: { select: { userId: true } },
      personB: { select: { userId: true } },
    },
  })
  if (!conversation) return

  const allUserIds = [
    conversation.person?.userId,
    conversation.company?.userId,
    conversation.personA?.userId,
    conversation.personB?.userId,
  ].filter(Boolean) as string[]

  return allUserIds 
}

export async function notifyNewMessageToUser(targetUserId: string, senderName: string) {
  await prisma.notification.create({
    data: {
      userId:  targetUserId,
      title:   'Nowa wiadomość',
      message: `${senderName} wysłał/a Ci wiadomość.`,
      type:    'MESSAGE' // Dodane przykładowe pole type
    } as any,
  })
}