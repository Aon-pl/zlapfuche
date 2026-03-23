'use server'

import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateReview(reviewId: string, data: { rating: number; comment?: string }) {
  const session = await auth()
  if (!session?.user) return { error: 'Nie jesteś zalogowany.' }

  if (data.rating < 1 || data.rating > 5) return { error: 'Ocena musi być od 1 do 5.' }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) return { error: 'Nie znaleziono opinii.' }

  // Sprawdź właściciela
  if (session.user.role === 'person') {
    const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile || review.authorPersonId !== profile.id) return { error: 'Brak uprawnień.' }
  } else if (session.user.role === 'company') {
    const profile = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
    if (!profile || review.authorCompanyId !== profile.id) return { error: 'Brak uprawnień.' }
  } else {
    return { error: 'Brak uprawnień.' }
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating:  data.rating,
      comment: data.comment ?? null,
    },
  })

  revalidatePath('/')
  return { success: true }
}
