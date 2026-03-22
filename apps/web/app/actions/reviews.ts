'use server'

import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Pobierz oceny dla firmy
export async function getCompanyReviews(companyId: string) {
  const reviews = await prisma.review.findMany({
    where: { targetCompanyId: companyId, type: 'person_reviews_company' },
    include: {
      authorPerson: { select: { firstName: true, lastName: true } },
      jobOffer:     { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return { reviews, avg: Math.round(avg * 10) / 10, count: reviews.length }
}

// Pobierz oceny dla osoby
export async function getPersonReviews(personId: string) {
  const reviews = await prisma.review.findMany({
    where: { targetPersonId: personId, type: 'company_reviews_person' },
    include: {
      authorCompany: { select: { companyName: true } },
      jobOffer:      { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const avg = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return { reviews, avg: Math.round(avg * 10) / 10, count: reviews.length }
}

// Osoba ocenia firmę
export async function reviewCompany(data: {
  companyId: string
  rating: number
  comment?: string
  jobOfferId?: string
}) {
  const session = await auth()
  if (!session?.user) return { error: 'Nie jesteś zalogowany.' }
  if (session.user.role !== 'person') return { error: 'Tylko osoby prywatne mogą oceniać firmy.' }

  if (data.rating < 1 || data.rating > 5) return { error: 'Ocena musi być od 1 do 5.' }

  const profile = await prisma.personProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return { error: 'Brak profilu.' }

  // Sprawdź czy już ocenił tę firmę dla tej oferty
  const existing = await prisma.review.findFirst({
    where: {
      authorPersonId: profile.id,
      targetCompanyId: data.companyId,
      jobOfferId: data.jobOfferId ?? null,
    },
  })
  if (existing) return { error: 'Już oceniłeś tę firmę dla tej oferty.' }

  await prisma.review.create({
    data: {
      type:           'person_reviews_company',
      rating:         data.rating,
      comment:        data.comment ?? null,
      authorPersonId: profile.id,
      targetCompanyId: data.companyId,
      jobOfferId:     data.jobOfferId ?? null,
    },
  })

  revalidatePath(`/offers`)
  return { success: true }
}

// Firma ocenia osobę
export async function reviewPerson(data: {
  personId: string
  rating: number
  comment?: string
  jobOfferId?: string
}) {
  const session = await auth()
  if (!session?.user) return { error: 'Nie jesteś zalogowany.' }
  if (session.user.role !== 'company') return { error: 'Tylko firmy mogą oceniać pracowników.' }

  if (data.rating < 1 || data.rating > 5) return { error: 'Ocena musi być od 1 do 5.' }

  const profile = await prisma.companyProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!profile) return { error: 'Brak profilu.' }

  const existing = await prisma.review.findFirst({
    where: {
      authorCompanyId: profile.id,
      targetPersonId:  data.personId,
      jobOfferId:      data.jobOfferId ?? null,
    },
  })
  if (existing) return { error: 'Już oceniłeś tę osobę dla tej oferty.' }

  await prisma.review.create({
    data: {
      type:            'company_reviews_person',
      rating:          data.rating,
      comment:         data.comment ?? null,
      authorCompanyId: profile.id,
      targetPersonId:  data.personId,
      jobOfferId:      data.jobOfferId ?? null,
    },
  })

  revalidatePath(`/dashboard/company`)
  return { success: true }
}

// Usuń ocenę (własną)
export async function deleteReview(reviewId: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Nie jesteś zalogowany.' }

  const profile = session.user.role === 'person'
    ? await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
    : await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })

  if (!profile) return { error: 'Brak profilu.' }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) return { error: 'Nie znaleziono oceny.' }

  const isOwner = session.user.role === 'person'
    ? review.authorPersonId === profile.id
    : review.authorCompanyId === profile.id

  if (!isOwner && session.user.role !== 'admin') return { error: 'Brak uprawnień.' }

  await prisma.review.delete({ where: { id: reviewId } })
  revalidatePath('/')
  return { success: true }
}
