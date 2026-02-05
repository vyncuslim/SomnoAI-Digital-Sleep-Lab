/**
 * SOMNO LAB ROUTE TRANSPARENCY PROTOCOL
 * Ensures middleware does not block Vercel rewrites for SPA clean URLs.
 */

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|favicon.png).*)',
  ],
};

export default function middleware() {
  // 仅作为通行证，确保 Vercel 的 rewrite 规则能够正常接管请求
  return;
}