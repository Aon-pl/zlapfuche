import { prisma } from './prisma'
import { auth } from '@/auth.node'

export type LogAction = 
  | 'USER_CREATED'
  | 'USER_DELETED'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED'
  | 'OFFER_CREATED'
  | 'OFFER_UPDATED'
  | 'OFFER_DELETED'
  | 'OFFER_BLOCKED'
  | 'COMPANY_CREATED'
  | 'COMPANY_VERIFIED'
  | 'APPLICATION_CREATED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'

interface LogParams {
  action: LogAction
  entity?: string
  entityId?: string
  details?: string
}

export async function logAction({ action, entity, entityId, details }: LogParams) {
  try {
    const session = await auth()
    
    await prisma.systemLog.create({
      data: {
        action,
        entity,
        entityId,
        userId: session?.user?.id || null,
        userEmail: session?.user?.email || null,
        details,
      },
    })
  } catch (error) {
    console.error('Failed to create log:', error)
  }
}

export async function logUserAction(userId: string, userEmail: string, action: LogAction, details?: string) {
  try {
    await prisma.systemLog.create({
      data: {
        action,
        userId,
        userEmail,
        details,
      },
    })
  } catch (error) {
    console.error('Failed to create log:', error)
  }
}
