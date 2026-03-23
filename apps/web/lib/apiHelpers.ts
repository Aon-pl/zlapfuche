import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const SECRET = process.env.AUTH_SECRET!

export function apiSuccess(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function createMobileToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, SECRET, { expiresIn: '30d' })
}

export async function getMobileUser(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null

  try {
    const token = auth.slice(7)
    const payload = jwt.verify(token, SECRET) as { userId: string; role: string }
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { personProfile: true, companyProfile: true },
    })
    if (!user || user.blocked) return null
    return user
  } catch {
    return null
  }
}
