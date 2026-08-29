import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from './auth'

export async function proxy(req: NextRequest) {
  const session = await auth()
  const { pathname } = req.nextUrl

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/notifications', '/settings', '/notebooks']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Already logged in — redirect away from auth pages
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/notebooks/:path*',
    '/login',
    '/signup',
  ],
}
