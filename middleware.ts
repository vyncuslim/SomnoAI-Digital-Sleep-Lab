/**
 * SOMNO LAB ROUTE TRANSPARENCY PROTOCOL
 * Middleware configuration updated to satisfy Vercel routing schema.
 */
export default function middleware(req: Request) {
  return null;
}

export const config = {
  // Fix: A non-empty matcher is required to prevent "Route at index X must define handle or src" errors
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)',
  ],
};