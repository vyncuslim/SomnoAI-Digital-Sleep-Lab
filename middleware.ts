import { NextResponse } from 'next/server';

/**
 * SOMNO LAB ROUTE TRANSPARENCY PROTOCOL
 * Ensures middleware correctly passes through to Vercel rewrites for SPA clean URLs.
 */

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|favicon.png).*)',
  ],
};

export default function middleware() {
  // 返回 NextResponse.next() 确保路由继续传递给 vercel.json 中的 rewrites
  return NextResponse.next();
}