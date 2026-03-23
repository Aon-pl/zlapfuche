'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth.node'
import { revalidatePath } from 'next/cache'

export async function updatePersonProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Nie jesteś zalogowany.' }

  try {
await prisma.$transaction(async (tx: any) => {
        await tx.user.update({
        where: { id: session.user.id },
        data: { phone: (formData.get('phone') as string) || null },
      })

      await tx.personProfile.update({
        where: { userId: session.user.id },
        data: {
          firstName:       formData.get('firstName') as string,
          lastName:        formData.get('lastName') as string,
          city:            (formData.get('city') as string) || null,
          bio:             (formData.get('bio') as string) || null,
          experienceYears: Number(formData.get('experienceYears')) || 0,
          skills:          (formData.get('skills') as string) || null,
          availableFrom:   formData.get('availableFrom')
            ? new Date(formData.get('availableFrom') as string)
            : null,
        },
      })
    })

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Update person profile error:', error)
    return { error: 'Nie udało się zaktualizować profilu.' }
  }
}

export async function updateCompanyProfile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Nie jesteś zalogowany.' }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: session.user.id },
        data: { phone: (formData.get('phone') as string) || null },
      })

      await tx.companyProfile.update({
        where: { userId: session.user.id },
        data: {
          companyName:  formData.get('companyName') as string,
          nip:          (formData.get('nip') as string) || null,
          city:         formData.get('city') as string,
          address:      (formData.get('address') as string) || null,
          website:      (formData.get('website') as string) || null,
          description:  (formData.get('description') as string) || null,
        },
      })
    })

    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Update company profile error:', error)
    return { error: 'Nie udało się zaktualizować profilu firmy.' }
  }
}
