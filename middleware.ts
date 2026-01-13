import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin dashboard routes
  if (pathname.startsWith('/admin/dashboard')) {
    const isAuthed = request.cookies.get('adminAuth')?.value === 'true'
    if (!isAuthed) {
      const url = new URL('/admin', request.url)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
}
