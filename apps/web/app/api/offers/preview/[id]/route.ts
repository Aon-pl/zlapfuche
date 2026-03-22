import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const offer = await prisma.jobOffer.findUnique({
    where: { id },
    select: {
      id:          true,
      title:       true,
      description: true,
      city:        true,
      salaryMin:   true,
      salaryMax:   true,
      salaryType:  true,
      category:    true,
      remote:      true,
      startDate:   true,
      drivingLicense: true,
      applicationsCount: true,
      company: { select: { id: true, companyName: true, companyLogoUrl: true } },
      person:  { select: { id: true, firstName: true, lastName: true } },
    },
  })

  if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ offer })
}
