import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/login(.*)', '/sign-up(.*)'])

const proxy = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return

  const { userId, sessionClaims } = await auth()

  if (!userId) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role
  const path = req.nextUrl.pathname

  if (path === '/') {
    if (role === 'doctor') return NextResponse.redirect(new URL('/dashboard/doctor', req.url))
    if (role === 'patient') return NextResponse.redirect(new URL('/dashboard/patient', req.url))
    if (role === 'staff') return NextResponse.redirect(new URL('/dashboard/staff', req.url))
  }

  if (path.startsWith('/dashboard/doctor') && role !== 'doctor')
    return NextResponse.redirect(new URL('/dashboard/' + role, req.url))
  if (path.startsWith('/dashboard/patient') && role !== 'patient')
    return NextResponse.redirect(new URL('/dashboard/' + role, req.url))
  if (path.startsWith('/dashboard/staff') && role !== 'staff')
    return NextResponse.redirect(new URL('/dashboard/' + role, req.url))
})

export { proxy }

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}