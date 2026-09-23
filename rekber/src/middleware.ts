import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// /dashboard/salinrekber sengaja dibuat publik — siapa pun yang menerima link
// harus bisa membuka & membayar tanpa perlu akun/login.
const PUBLIC_EXCEPTIONS = ['/dashboard/salinrekber'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_EXCEPTIONS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/formrekber'],
};
