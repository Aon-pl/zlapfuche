import { auth } from '@/auth.edge'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user

  const protectedPaths = ['/dashboard', '/profile', '/offers/new']
  const authPaths = ['/login', '/register']

  const isProtected = protectedPaths.some(p => nextUrl.pathname.startsWith(p))
  const isAuthPage = authPaths.some(p => nextUrl.pathname.startsWith(p))

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
