import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.node'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'company') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { reply } = await req.json()

  if (!reply?.trim()) {
    return NextResponse.json({ error: 'Odpowiedź nie może być pusta' }, { status: 400 })
  }

  // Sprawdź czy ta opinia dotyczy tej firmy
  const company = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } })
  if (!company) return NextResponse.json({ error: 'Brak profilu firmy' }, { status: 404 })

  const review = await prisma.review.findUnique({ where: { id } })
  if (!review || review.targetCompanyId !== company.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (review.companyReply) {
    return NextResponse.json({ error: 'Już odpowiedziałeś na tę opinię' }, { status: 400 })
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      companyReply:     reply.trim(),
      companyRepliedAt: new Date(),
    },
  })

  return NextResponse.json({ review: updated })
}
