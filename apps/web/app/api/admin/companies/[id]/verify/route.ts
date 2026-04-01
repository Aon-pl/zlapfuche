import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'
import { logAction } from '@/lib/logs'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const { verified } = await req.json()

  const company = await prisma.companyProfile.findUnique({ where: { id } })
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const updated = await prisma.companyProfile.update({
    where: { id },
    data: { verified },
  })

  await logAction({
    action: verified ? 'COMPANY_VERIFIED' : 'COMPANY_CREATED',
    entity: 'CompanyProfile',
    entityId: id,
    details: `Company "${company.companyName}" ${verified ? 'verified' : 'verification revoked'} by ${session.user.email}`,
  })

  return NextResponse.json({ success: true, verified: updated.verified })
}
