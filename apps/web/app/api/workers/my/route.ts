import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

// GET — pobierz moje ogłoszenie
export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'person') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ ad: null })

  const ad = await prisma.jobSeeker.findUnique({ where: { personId: profile.id } })
  return NextResponse.json({ ad })
}

// POST — utwórz lub zaktualizuj ogłoszenie
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'person') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.personProfile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({ error: 'Brak profilu' }, { status: 404 })

  const formData      = await req.formData()
  const title         = formData.get('title')         as string
  const city          = formData.get('city')          as string
  const description   = formData.get('description')   as string | null
  const skills        = formData.get('skills')        as string | null
  const expectedSalary = formData.get('expectedSalary') ? Number(formData.get('expectedSalary')) : null
  const salaryType    = formData.get('salaryType')    as string
  const availableFrom = formData.get('availableFrom') ? new Date(formData.get('availableFrom') as string) : null
  const drivingLicense = formData.get('drivingLicense') === 'on'
  const experienceYears = formData.get('experienceYears') ? Number(formData.get('experienceYears')) : 0

  if (!title || !city) return NextResponse.json({ error: 'Tytuł i miasto są wymagane' }, { status: 400 })

  const data = {
    title, city, description, skills, expectedSalary, salaryType,
    availableFrom, drivingLicense, experienceYears,
  }

  const existing = await prisma.jobSeeker.findUnique({ where: { personId: profile.id } })

  const ad = existing
    ? await prisma.jobSeeker.update({ where: { id: existing.id }, data })
    : await prisma.jobSeeker.create({ data: { ...data, personId: profile.id, active: true } })

  return NextResponse.json({ ad })
}
