'use server'

import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteReview(reviewId: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Nie jesteś zalogowany.' }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) return { error: 'Nie znaleziono opinii.' }

  // Sprawdź czy to własna opinia
  if (session.user.role === 'person') {
    const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile || review.authorPersonId !== profile.id) return { error: 'Brak uprawnień.' }
  } else if (session.user.role === 'company') {
    const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile || review.authorCompanyId !== profile.id) return { error: 'Brak uprawnień.' }
  } else if (session.user.role !== 'admin') {
    return { error: 'Brak uprawnień.' }
  }

  await prisma.review.delete({ where: { id: reviewId } })
  revalidatePath('/')
  return { success: true }
}
