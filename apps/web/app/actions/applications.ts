'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth.node'
import { revalidatePath } from 'next/cache'
import { notifyNewApplication, notifyStatusChange } from '@/app/actions/notifications'

export async function applyForOffer(offerId: string, coverLetter: string | null) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Nie jesteś zalogowany.' }
  if (session.user.role !== 'person') return { error: 'Tylko osoby prywatne mogą aplikować.' }

  try {
    const offer = await prisma.jobOffer.findUnique({ where: { id: offerId } })
    if (!offer) return { error: 'Oferta nie istnieje.' }
    if (offer.status !== 'active') return { error: 'Oferta nie jest aktywna.' }
    if (offer.endDate && offer.endDate < new Date()) return { error: 'Termin aplikacji już minął.' }

    const person = await prisma.personProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!person) return { error: 'Nie masz profilu.' }

    const app = await prisma.application.create({
      data: {
        offerId,
        applicantId: person.id,
        coverLetter,
        status: 'pending',
      },
    })

    await prisma.jobOffer.update({
      where: { id: offerId },
      data: { applicationsCount: { increment: 1 } },
    })

    // Powiadomienie dla właściciela oferty
    await notifyNewApplication(app.id)

    revalidatePath(`/offers/${offerId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    if (error?.code === 'P2002') return { error: 'Już aplikowałeś na tę ofertę.' }
    console.error('Apply error:', error)
    return { error: 'Nie udało się wysłać aplikacji.' }
  }
}

export async function withdrawApplication(applicationId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Nie jesteś zalogowany.' }

  try {
    const person = await prisma.personProfile.findUnique({
      where: { userId: session.user.id },
    })
    if (!person) return { error: 'Brak profilu.' }

    const app = await prisma.application.findFirst({
      where: { id: applicationId, applicantId: person.id },
    })
    if (!app) return { error: 'Nie znaleziono aplikacji.' }

    await prisma.application.delete({ where: { id: applicationId } })
    await prisma.jobOffer.update({
      where: { id: app.offerId },
      data: { applicationsCount: { decrement: 1 } },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    return { error: 'Nie udało się wycofać aplikacji.' }
  }
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Nie jesteś zalogowany.' }

  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        offer: {
          include: {
            company: true,
            person: true,
          },
        },
      },
    })
    if (!app) return { error: 'Nie znaleziono aplikacji.' }

    const isOwner =
      (session.user.role === 'company' && app.offer.company?.userId === session.user.id) ||
      (session.user.role === 'person'  && app.offer.person?.userId  === session.user.id)

    if (!isOwner) return { error: 'Brak uprawnień.' }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus as any },
    })

    // Powiadomienie dla aplikanta
    await notifyStatusChange(applicationId, newStatus)

    revalidatePath(`/offers/${app.offerId}/applications`)
    return { success: true }
  } catch (error) {
    console.error('Update application status error:', error)
    return { error: 'Nie udało się zaktualizować statusu.' }
  }
}
